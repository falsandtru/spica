import { Supervisor as ISupervisor } from '../../index.d';
import { Observable } from './observable';
import { Tick } from './tick';
import { isThenable } from './thenable';
import { sqid } from './sqid';
import { stringify } from './stringify';
import { noop } from './noop';

export abstract class Supervisor<N extends string, P, R, S> implements ISupervisor<N, P, R, S> {
  public static count: number = 0;
  public static procs: number = 0;
  constructor({
    name = '',
    size = Infinity,
    timeout = Infinity,
    destructor = noop
  }: Supervisor.Settings<N> = {}) {
    if (this.constructor === Supervisor) throw new Error(`Spica: Supervisor: <${this.id}/${this.name}>: Cannot instantiate abstract classes.`);
    this.name = name;
    this.size = size;
    this.timeout = timeout;
    this.destructor_ = destructor;
    void ++(<typeof Supervisor>this.constructor).count;
  }
  private destructor(reason: any): void {
    assert(this.alive === true);
    assert(this.available === true);
    this.available = false;
    void Array.from(this.workers.values())
      .forEach(worker =>
        void worker.terminate(reason));
    assert(this.workers.size === 0);
    void this.deliver();
    assert(this.messages.length === 0);
    this.alive = false;
    void --(<typeof Supervisor>this.constructor).count;
    void Object.freeze(this);
    assert(this.alive === false);
    assert(this.available === false);
    void this.destructor_(reason);
  }
  public readonly id: string = sqid();
  public readonly name: string;
  private readonly size: number;
  private readonly timeout: number;
  private readonly destructor_: (reason: any) => any;
  public readonly events = {
    init: new Observable<never[] | [N], Supervisor.Event.Data.Init<N, P, R, S>, any>(),
    loss: new Observable<never[] | [N], Supervisor.Event.Data.Loss<N, P>, any>(),
    exit: new Observable<never[] | [N], Supervisor.Event.Data.Exit<N, P, R, S>, any>()
  };
  private readonly workers = new Map<N, Worker<N, P, R, S>>();
  private alive = true;
  private available = true;
  private validate(): void {
    if (!this.available) throw new Error(`Spica: Supervisor: <${this.id}/${this.name}>: A supervisor is already terminated.`);
  }
  public register(name: N, process: Supervisor.Process.Call<P, R, S>, state: S): (reason?: any) => boolean;
  public register(name: N, process: Supervisor.Process<P, R, S>, state: S): (reason?: any) => boolean;
  public register(name: N, process: Supervisor.Process<P, R, S> | Supervisor.Process.Call<P, R, S>, state: S): (reason?: any) => boolean;
  public register(name: N, process: Supervisor.Process<P, R, S> | Supervisor.Process.Call<P, R, S>, state: S): (reason?: any) => boolean {
    void this.validate();
    if (this.workers.has(name)) throw new Error(`Spica: Supervisor: <${this.id}/${this.name}/${name}>: Cannot register a process multiply with the same name.`);
    void this.schedule();
    process = typeof process === 'function'
      ? {
          init: state => state,
          call: process,
          exit: _ => void 0
        }
      : process;
    void ++(<typeof Supervisor>this.constructor).procs;
    return this.workers
      .set(name, new Worker<N, P, R, S>(this, name, process, state, () => (
        void this.workers.delete(name),
        void --(<typeof Supervisor>this.constructor).procs)))
      .get(name)!
      .terminate;
  }
  public call(name: N, param: P, callback: Supervisor.Callback<R>, timeout = this.timeout): void {
    void this.validate();
    while (this.messages.length + 1 > this.size) {
      const [name, param, callback] = this.messages.shift()!;
      void this.events.loss.emit([name], [name, param]);
      try {
        void callback(<any>void 0, new Error(`Spica: Supervisor: A message overflowed.`));
      }
      catch (reason) {
        void console.error(stringify(reason));
      }
    }
    void this.messages.push([
      name,
      param,
      callback,
      timeout,
      Date.now()
    ]);
    void this.schedule();
    if (timeout <= 0) return;
    if (timeout === Infinity) return;
    void setTimeout(() => void this.deliver(), timeout + 9);
  }
  public cast(name: N, param: P, timeout = this.timeout): boolean {
    void this.validate();
    const result = this.workers.has(name)
      ? this.workers.get(name)!.call([param, timeout])
      : void 0;
    if (result === void 0) {
      void this.events.loss.emit([name], [name, param]);
    }
    if (result === void 0 || result instanceof Error) return false;
    return true;
  }
  public refs(name?: N): [N, Supervisor.Process<P, R, S>, S, (reason: any) => boolean][] {
    void this.validate();
    return name === void 0
      ? Array.from(this.workers.values()).map(convert)
      : this.workers.has(name)
        ? [convert(this.workers.get(name)!)]
        : [];

    function convert(worker: Worker<N, P, R, S>): [N, Supervisor.Process<P, R, S>, S, (reason: any) => boolean] {
      assert(worker instanceof Worker);
      return [
        worker.name,
        worker.process,
        worker.state,
        worker.terminate
      ];
    }
  }
  public terminate(name?: N, reason?: any): boolean {
    if (!this.available) return false;
    assert(this.alive === true);
    return name === void 0
      ? void this.destructor(reason) === void 0
      : Array.from(this.workers.values())
          .filter(worker => worker.name === name)
          .filter(worker => worker.terminate(reason))
          .length > 0;
  }
  public schedule(): void {
    void Tick(this.deliver, true);
  }
  private readonly resource: number = 10;
  private readonly messages: [N, P, Supervisor.Callback<R>, number, number][] = [];
  private readonly deliver = (): void => {
    const since = Date.now();
    let resource = this.resource;
    for (let i = 0, len = this.messages.length; this.available && i < len && resource > 0; ++i) {
      const now = Date.now();
      resource -= now - since;
      const [name, param, callback, timeout, registered] = this.messages[i];
      const result = this.workers.has(name)
        ? this.workers.get(name)!.call([param, registered + timeout - now])
        : void 0;
      if (this.available && !result && now < registered + timeout) continue;
      i === 0
        ? void this.messages.shift()
        : void this.messages.splice(i, 1);
      void --i;
      void --len;

      if (result === void 0) {
        void this.events.loss.emit([name], [name, param]);
      }
      if (result === void 0 || result instanceof Error) {
        try {
          void callback(<any>void 0, new Error(`Spica: Supervisor: A processing has failed.`));
        }
        catch (reason) {
          void console.error(stringify(reason));
        }
        continue;
      }
      const [reply] = result;
      if (!isThenable(reply)) {
        try {
          void callback(reply);
        }
        catch (reason) {
          void console.error(stringify(reason));
        }
      }
      else {
        void Promise.resolve(reply)
          .then(
            reply =>
              this.available
                ? void callback(reply)
                : void callback(<any>void 0, new Error(`Spica: Supervisor: A processing has failed.`)),
            () =>
              void callback(<any>void 0, new Error(`Spica: Supervisor: A processing has failed.`)))
          .catch(
            reason =>
              void console.error(stringify(reason)));
      }
    }
    if (!this.available) {
      while (this.messages.length > 0) {
        const [name, param] = this.messages.shift()!;
        void this.events.loss.emit([name], [name, param]);
      }
      void Object.freeze(this.messages);
      return;
    }
    if (resource > 0) return;
    void this.schedule();
  }
}
export namespace Supervisor {
  export type Settings<N extends string> = ISupervisor.Settings<N>;
  export type Process<P, R, S> = ISupervisor.Process<P, R, S>;
  export namespace Process {
    export type Init<S> = ISupervisor.Process.Init<S>;
    export type Call<P, R, S> = ISupervisor.Process.Call<P, R, S>;
    export type Exit<S> = ISupervisor.Process.Exit<S>;
  }
  export type Callback<R> = ISupervisor.Callback<R>;
  export import Event = ISupervisor.Event;
}

class Worker<N extends string, P, R, S> {
  constructor(
    private readonly sv: Supervisor<N, P, R, S>,
    public readonly name: N,
    public readonly process: Supervisor.Process<P, R, S>,
    public state: S,
    private readonly destructor_: () => any
  ) {
    assert(process.init && process.exit);
  }
  private destructor(reason: any): void {
    assert(this.alive === true);
    this.alive = false;
    this.available = false;
    void Object.freeze(this);
    assert(this.alive === false);
    assert(this.available === false);
    void this.destructor_();
    try {
      void this.process.exit(reason, this.state);
      void this.sv.events.exit
        .emit([this.name], [this.name, this.process, this.state, reason]);
    }
    catch (reason_) {
      void this.sv.events.exit
        .emit([this.name], [this.name, this.process, this.state, reason]);
      void this.sv.terminate(void 0, reason_);
    }
  }
  private alive = true;
  private available = true;
  private times = 0;
  public readonly call = ([param, timeout]: Worker.Command<P>): [R | Promise<R>] | Error | void => {
    if (!this.available) return;
    try {
      this.available = false;
      void ++this.times;
      if (this.times === 1) {
        void this.sv.events.init
          .emit([this.name], [this.name, this.process, this.state]);
        this.state = this.process.init(this.state);
      }
      const result = this.process.call(param, this.state);
      if (!isThenable(result)) {
        const [reply, state] = result;
        this.state = state;
        this.available = true;
        return [reply];
      }
      else {
        return [
          new Promise<[R, S]>((resolve, reject) => (
            void result.then(resolve, reject),
            timeout === Infinity
              ? void 0
              : void setTimeout(() => void reject(new Error()), timeout)))
            .then<[R, S]>(
              ([reply, state]) => [reply, state])
            .then<R>(
              ([reply, state]) => {
                void this.sv.schedule();
                if (!this.alive) return Promise.reject(new Error());
                this.state = state;
                this.available = true;
                return reply;
              },
              reason => {
                void this.sv.schedule();
                void this.terminate(reason);
                throw reason;
              })
        ];
      }
    }
    catch (reason) {
      void this.terminate(reason);
      return new Error();
    }
  }
  public readonly terminate = (reason: any): boolean => {
    if (!this.alive) return false;
    void this.destructor(reason);
    return true;
  }
}
namespace Worker {
  export type Command<P> = [P, number];
}
