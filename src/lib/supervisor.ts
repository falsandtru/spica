import { Supervisor as ISupervisor } from 'spica';
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
    timeout = 0,
    destructor = noop
  }: Supervisor.Settings<N> = {}) {
    if (this.constructor === Supervisor) throw new Error(`Spica: Supervisor: <${this.id}/${this.name}>: Cannot instantiate abstract classes.`);
    this.name = name;
    this.timeout = timeout;
    this.destructor_ = destructor;
    void ++(<typeof Supervisor>this.constructor).count;
  }
  private destructor(reason: any): void {
    void this.validate();
    assert(this.available === false);
    this.alive = false;
    assert(this.workers.size === 0);
    void this.drain();
    try {
      void this.destructor_(reason);
    }
    catch (reason) {
      void console.error(stringify(reason));
      assert(!console.info(reason + ''));
    }
    void --(<typeof Supervisor>this.constructor).count;
    void Object.freeze(this);
  }
  public readonly id: string = sqid();
  public readonly name: string;
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
    if (!this.alive) throw new Error(`Spica: Supervisor: <${this.id}/${this.name}>: A supervisor is already terminated.`);
  }
  private scheduled = false;
  public schedule(): void {
    if (!this.alive) return;
    if (this.scheduled) return;
    void Tick(() => {
      if (!this.alive) return;
      this.scheduled = false;
      void this.drain();
    });
    this.scheduled = true;
  }
  public register(name: N, process: Supervisor.Process<P, R, S> | Supervisor.Process.Call<P, R, S>, state: S): (reason?: any) => void {
    void this.validate();
    if (!this.available) throw new Error(`Spica: Supervisor: <${this.id}/${this.name}/${name}>: Cannot register a process after a supervisor is terminated.`);
    if (this.workers.has(name)) throw new Error(`Spica: Supervisor: <${this.id}/${this.name}/${name}>: Cannot register a process multiply using the same name.`);
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
    void this.queue.push([
      name,
      param,
      callback,
      timeout,
      Date.now()
    ]);
    void this.schedule();
    if (timeout < Infinity === false) return;
    if (timeout > 0 === false) return;
    void setTimeout(() => void this.drain(name), timeout + 9);
  }
  public cast(name: N, param: P, timeout = this.timeout): boolean {
    void this.validate();
    const result = this.workers.has(name)
      ? this.workers.get(name)!.call([param, timeout])
      : void 0;
    if (!result) {
      void this.events.loss.emit([name], [name, param]);
    }
    return !!result;
  }
  public refs(name?: N): [N, Supervisor.Process<P, R, S>, S, (reason: any) => void][] {
    void this.validate();
    return name === void 0
      ? Array.from(this.workers.values()).map(convert)
      : this.workers.has(name)
        ? [convert(this.workers.get(name)!)]
        : [];

    function convert(worker: Worker<N, P, R, S>): [N, Supervisor.Process<P, R, S>, S, (reason: any) => void] {
      assert(worker instanceof Worker);
      return [
        worker.name,
        worker.process,
        worker.state,
        worker.terminate
      ];
    }
  }
  public terminate(name?: N, reason?: any): void {
    if (!this.available) return;
    if (name === void 0) {
      this.available = false;
    }
    void this.refs(name)
      .forEach(([, , , terminate]) =>
        void terminate(reason));
    if (name === void 0) {
      void this.destructor(reason);
    }
  }
  private readonly queue: [N, P, Supervisor.Callback<R>, number, number][] = [];
  private drain(target?: N): void {
    const now = Date.now();
    for (let i = 0; i < this.queue.length; ++i) {
      const [name, param, callback, timeout, since] = this.queue[i];
      const result: [R | Promise<R>] | void =
        target === void 0 || target === name
          ? this.workers.has(name)
            ? <[R | Promise<R>]>this.workers.get(name)!.call([param, since + timeout - now])
            : void 0
          : void 0;
      if (this.alive && !result && now < since + timeout) continue;
      i === 0
        ? void this.queue.shift()
        : void this.queue.splice(i, 1);
      void --i;

      if (!result) {
        void this.events.loss.emit([name], [name, param]);
        try {
          void callback(<any>void 0, new Error(`Spica: Supervisor: Task: Failed.`));
        }
        catch (reason) {
          void console.error(stringify(reason));
        }
      }
      else {
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
                this.alive
                  ? void callback(reply)
                  : void callback(<any>void 0, new Error(`Spica: Supervisor: Task: Failed.`)),
              () =>
                void callback(<any>void 0, new Error(`Spica: Supervisor: Task: Failed.`)))
            .catch(
              reason =>
                void console.error(stringify(reason)));
        }
      }
    }
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
    if (!this.alive) return;
    this.alive = false;
    this.available = false;
    void this.destructor_();
    void Object.freeze(this);
    try {
      void this.process.exit(this.state, reason);
      void this.sv.events.exit
        .emit([this.name], [this.name, this.process, this.state, reason]);
    }
    catch (reason) {
      void this.sv.events.exit
        .emit([this.name], [this.name, this.process, this.state, reason]);
      void this.sv.terminate(void 0, reason);
    }
  }
  private alive = true;
  private available = true;
  private times = 0;
  public readonly call = ([param, timeout]: Worker.Command<P>): [R | Promise<R>] | void => {
    if (!this.alive) return;
    if (this.available === false) return;
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
            timeout < Infinity === false
              ? void 0
              : void setTimeout(() => void reject(new Error()), timeout)))
            .then(
              ([reply, state]): R | Promise<R> => {
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
      return;
    }
  }
  public readonly terminate = (reason: any): void => {
    void this.destructor(reason);
  }
}
namespace Worker {
  export type Command<P> = [P, number];
}
