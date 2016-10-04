import {Supervisor as ISupervisor} from 'spica';
import {Observable} from './observable';
import {Tick} from './tick';
import {isThenable} from './thenable';
import {sqid} from './sqid';
import {noop} from './noop';

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
    void this.checkState();
    assert(this.registerable === false);
    this.alive = false;
    assert(this.procs.refs([]).length === 0);
    void this.drain();
    try {
      void this.destructor_(reason);
    }
    catch (err) {
      void console.error(err);
      assert(!console.info(err + ''));
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
  private readonly procs: Observable<never[] | [N], WorkerCommand<P>, R | PromiseLike<R>> = new Observable<[N], WorkerCommand<P>, R | PromiseLike<R>>();
  private alive = true;
  private registerable = true;
  private scheduled = false;
  public schedule(): void {
    if (!this.alive) return;
    if (this.scheduled) return;
    void Tick(_ => {
      if (!this.alive) return;
      this.scheduled = false;
      void this.drain();
    });
    this.scheduled = true;
  }
  private readonly workerSharedResource: WorkerSharedResources<N, P, R> = {
    procs: this.procs
  };
  public register(name: N, process: Supervisor.Process<P, R, S> | Supervisor.Process.Call<P, R, S>, state: S): (reason?: any) => void {
    void this.checkState();
    if (!this.registerable) throw new Error(`Spica: Supervisor: <${this.id}/${this.name}/${name}>: Cannot register a process after a supervisor is terminated.`);
    if (this.procs.refs([name]).length > 0) throw new Error(`Spica: Supervisor: <${this.id}/${this.name}/${name}>: Cannot register a process multiply using the same name.`);
    void this.schedule();
    process = typeof process === 'function'
      ? {
        init: state => state,
        call: process,
        exit: _ => void 0
      }
      : process;
    return new Worker<N, P, R, S>(this, this.workerSharedResource, name, process, state).terminate;
  }
  public call(name: N, param: P, callback: Supervisor.Callback<R>, timeout = this.timeout): void {
    void this.checkState();
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
    void this.checkState();
    const results = this.procs.reflect([name], new WorkerCommand.Call(param, timeout));
    assert(results.length <= 1);
    if (results.length === 0) {
      void this.events.loss.emit([name], [name, param]);
    }
    return results.length > 0;
  }
  public refs(name?: N): [N, Supervisor.Process<P, R, S>, S, (reason: any) => void][] {
    void this.checkState();
    return this.procs.refs(name === void 0 ? [] : [name])
      .map<[N, Supervisor.Process<P, R, S>, S, (reason: any) => void]>(([, recv]) => {
        const worker: Worker<N, P, R, S> = <any>recv(new WorkerCommand.Self());
        assert(worker instanceof Worker);
        return [
          worker.name,
          worker.process,
          worker.state,
          worker.terminate
        ];
      });
  }
  public terminate(name?: N, reason?: any): void {
    if (!this.registerable) return;
    if (name === void 0) {
      this.registerable = false;
    }
    const namespace = name === void 0 ? [] : <[N]>[name];
    void this.procs
      .emit(namespace, new WorkerCommand.Exit(reason));
    void this.procs
      .off(namespace);
    if (name === void 0) {
      void this.destructor(reason);
    }
  }
  private checkState(): void {
    if (!this.alive) throw new Error(`Spica: Supervisor: <${this.id}/${this.name}>: A supervisor is already terminated.`);
  }
  private readonly queue: [N, P, Supervisor.Callback<R>, number, number][] = [];
  private drain(target?: N): void {
    const now = Date.now();
    for (let i = 0; i < this.queue.length; ++i) {
      const [name, param, callback, timeout, since] = this.queue[i];
      const replies: [R | PromiseLike<R>] | never[] = target === void 0 || target === name
        ? <[R | PromiseLike<R>]>this.procs.reflect([name], new WorkerCommand.Call(param, since + timeout - now))
        : [];
      assert(replies.length <= 1);
      if (this.alive && replies.length === 0 && now < since + timeout) continue;
      i === 0
        ? void this.queue.shift()
        : void this.queue.splice(i, 1);
      void --i;

      if (replies.length === 0) {
        void this.events.loss.emit([name], [name, param]);
      }
      if (this.alive && replies.length > 0) {
        const [reply] = replies;
        if (isThenable(reply)) {
          void Promise.resolve(reply)
            .then(
              reply =>
                this.alive
                  ? void callback(reply)
                  : void callback(<any>void 0, new Error(`Spica: Supervisor: <${this.id}/${this.name}/${name}>: A request is expired.`)),
              reason =>
                void callback(<any>void 0, reason));
        }
        else {
          try {
            void callback(reply);
          }
          catch (reason) {
            void console.error(reason);
          }
        }
      }
      else {
        void callback(<any>void 0, new Error(`Spica: Supervisor: <${this.id}/${this.name}/${name}>: A request is expired.`));
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

interface WorkerSharedResources<N extends string, P, R> {
  procs: Observable<never[] | [N], WorkerCommand<P>, R | PromiseLike<R>>;
}

type WorkerCommand<P>
  = WorkerCommand.Self
  | WorkerCommand.Call<P>
  | WorkerCommand.Exit;

namespace WorkerCommand {
  export class Self {
    private readonly COMMAND: this;
    constructor() {
      void this.COMMAND;
    }
  }
  export class Call<P> {
    private readonly COMMAND: this;
    constructor(public readonly param: P, public readonly timeout: number) {
      void this.COMMAND;
    }
  }
  export class Exit {
    private readonly COMMAND: this;
    constructor(public readonly reason: any) {
      void this.COMMAND;
    }
  }
}

class Worker<N extends string, P, R, S> {
  constructor(
    private readonly sv: Supervisor<N, P, R, S>,
    private readonly sharedResource: WorkerSharedResources<N, P, R>,
    public readonly name: N,
    public readonly process: Supervisor.Process<P, R, S>,
    public state: S
  ) {
    assert(process.init && process.exit);
    // fix the context, and that must be an immutable unique identifier.
    this.receive = (cmd: WorkerCommand<P>) => Worker.prototype.receive.call(this, cmd);
    this.terminate = (reason: any) => Worker.prototype.terminate.call(this, reason);

    void ++(<typeof Supervisor>this.sv.constructor).procs;
    void this.sharedResource.procs
      .on([name], this.receive);
  }
  private destructor(reason: any): void {
    if (!this.alive) return;
    void this.sharedResource.procs
      .off([this.name], this.receive);
    this.alive = false;
    void --(<typeof Supervisor>this.sv.constructor).procs;
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
  private called = false;
  private concurrency: number = 1;
  public receive(cmd: WorkerCommand.Self): Worker<N, P, R, S>
  public receive(cmd: WorkerCommand<P>): R | PromiseLike<R>
  public receive(cmd: WorkerCommand<P>): Worker<N, P, R, S> | boolean | R | PromiseLike<R> {
    void this.checkState();
    if (cmd instanceof WorkerCommand.Call) {
      if (this.concurrency === 0) throw void 0; // cancel
      try {
        void --this.concurrency;
        if (!this.called) {
          this.called = true;
          void this.sv.events.init
            .emit([this.name], [this.name, this.process, this.state]);
          this.state = this.process.init(this.state);
        }
        const result = this.process.call(cmd.param, this.state);
        if (isThenable(result)) {
          return new Promise<[R, S]>((resolve, reject) => {
            void result.then(resolve, reject);
            if (cmd.timeout < Infinity === false) return;
            void setTimeout(() => void reject(new Error(`Spica: Supervisor: <${this.sv.id}/${this.sv.name}/${this.name}>: Timeout while processing.`)), cmd.timeout);
          })
            .then(
              ([reply, state]) => {
                void ++this.concurrency;
                void this.sv.schedule();
                if (!this.alive) throw void 0;
                this.state = state;
                return reply;
              },
              reason => {
                void ++this.concurrency;
                void this.sv.schedule();
                if (!this.alive) throw reason;
                void this.terminate(reason);
                throw reason;
              });
        }
        else {
          void ++this.concurrency;
          const [reply, state] = result;
          this.state = state;
          return reply;
        }
      }
      catch (reason) {
        void this.terminate(reason);
        throw void 0;
      }
    }
    if (cmd instanceof WorkerCommand.Exit) {
      void this.terminate(cmd.reason);
      throw void 0;
    }
    if (cmd instanceof WorkerCommand.Self) {
      return this;
    }
    throw new TypeError(`Spica: Supervisor: <${this.sv.id}/${this.sv.name}/${this.name}>: Invalid command: ${cmd}`);
  }
  public terminate(reason: any): void {
    void this.destructor(reason);
  }
  private checkState(): void {
    if (!this.alive) throw new Error(`Spica: Supervisor: <${this.sv.id}/${this.sv.name}/${this.name}>: A process is already terminated:\n${this.process}`);
  }
}
