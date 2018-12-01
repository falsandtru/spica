import { AtomicPromise } from './promise';
import { AtomicFuture } from './future';
import { Observation, Observer, Publisher } from './observation';
import { DeepRequired } from './type';
import { extend } from './assign';
import { tick } from './clock';
import { sqid } from './sqid';
import { noop } from './noop';
import { causeAsyncException } from './exception';

export interface SupervisorOptions {
  readonly name?: string;
  readonly size?: number;
  readonly timeout?: number;
  readonly destructor?: (reason: any) => void;
  readonly scheduler?: (cb: () => void) => void;
  readonly resource?: number;
}

export abstract class Supervisor<N extends string, P = void, R = void, S = void> extends AtomicPromise<void> {
  private static instances_: Set<Supervisor<string, any, any, any>>;
  private static get instances(): typeof Supervisor.instances_ {
    return this.hasOwnProperty('instances_')
      ? this.instances_
      : this.instances_ = new Set();
  }
  public static get count(): number {
    return this.instances.size;
  }
  public static get procs(): number {
    return [...this.instances]
      .reduce((acc, sv) =>
        acc + sv.workers.size
      , 0);
  }
  protected static readonly standalone = new WeakSet<Supervisor.Process<any, any, any>>();
  constructor(opts: SupervisorOptions = {}) {
    super((resolve, reject) => (
      cb = [resolve, reject],
      { next: () => new AtomicPromise(r => void tick(() => r({ value: this.state, done: true }))) }));
    var cb: [() => void, () => void];
    void this.state.then(...cb!);
    void Object.freeze(extend(this.settings, opts));
    assert(Object.isFrozen(this.settings));
    this.name = this.settings.name;
    if (this.constructor === Supervisor) throw new Error(`Spica: Supervisor: <${this.id}/${this.name}>: Cannot instantiate abstract classes.`);
    void (this.constructor as typeof Supervisor).instances.add(this);
  }
  protected state = new AtomicFuture<void>();
  private destructor(reason: any): void {
    assert(this.alive === true);
    assert(this.available === true);
    this.available_ = false;
    void this.workers
      .forEach(worker =>
        void worker.terminate(reason));
    assert(this.workers.size === 0);
    void Object.freeze(this.workers);
    while (this.messages.length > 0) {
      const [name, param] = this.messages.shift()!;
      const names = typeof name === 'string'
        ? [name]
        : [...name];
      void this.events_.loss.emit([names[0]], [names[0], param]);
    }
    assert(this.messages.length === 0);
    void Object.freeze(this.messages);
    this.alive = false;
    void (this.constructor as typeof Supervisor).instances.delete(this);
    void Object.freeze(this);
    assert(this.alive === false);
    assert(this.available === false);
    void this.settings.destructor(reason);
    void this.state.bind(reason === undefined ? undefined : AtomicPromise.reject(reason));
  }
  public readonly id: string = sqid();
  public readonly name: string;
  private readonly settings: DeepRequired<SupervisorOptions> = {
    name: '',
    size: Infinity,
    timeout: Infinity,
    destructor: (_: any) => undefined,
    scheduler: tick,
    resource: 10,
  };
  private readonly events_ = {
    init: new Observation<[N], Supervisor.Event.Data.Init<N, P, R, S>, any>(),
    loss: new Observation<[N], Supervisor.Event.Data.Loss<N, P>, any>(),
    exit: new Observation<[N], Supervisor.Event.Data.Exit<N, P, R, S>, any>(),
  };
  public readonly events: {
    readonly init: Observer<[N], Supervisor.Event.Data.Init<N, P, R, S>, any>;
    readonly loss: Observer<[N], Supervisor.Event.Data.Loss<N, P>, any>;
    readonly exit: Observer<[N], Supervisor.Event.Data.Exit<N, P, R, S>, any>;
  } = this.events_;
  private readonly workers = new Map<N, Worker<N, P, R, S>>();
  private alive = true;
  private available_ = true;
  public get available(): boolean {
    return this.available_;
  }
  private throwErrorIfNotAvailable(): void {
    if (!this.available) throw new Error(`Spica: Supervisor: <${this.id}/${this.name}>: A supervisor is already terminated.`);
  }
  public register(name: N, process: Supervisor.Process<P, R, S> | Supervisor.Process.Main<P, R, S>, state: S, reason?: any): (reason?: any) => boolean {
    void this.throwErrorIfNotAvailable();
    if (arguments.length > 3) {
      void this.kill(name, reason);
      return this.register(name, process, state);
    }
    if (typeof process === 'function') return this.register(name, { init: state => state, main: process, exit: _ => undefined }, state);
    if (this.workers.has(name)) throw new Error(`Spica: Supervisor: <${this.id}/${this.name}/${name}>: Cannot register a process multiply with the same name.`);
    void this.schedule();
    return this.workers
      .set(name, new Worker<N, P, R, S>(this, name, process, state, Supervisor.standalone.has(process), this.events_, () =>
        void this.workers.delete(name)))
      .get(name)!
      .terminate;
  }
  public call(name: N | ('' extends N ? undefined : never), param: P, timeout?: number): AtomicPromise<R>;
  public call(name: N | ('' extends N ? undefined : never), param: P, callback: Supervisor.Callback<R>, timeout?: number): void;
  public call(name: N | ('' extends N ? undefined : never), param: P, callback: Supervisor.Callback<R> | number = this.settings.timeout, timeout = this.settings.timeout): AtomicPromise<R> | void {
    return this.call_(name === undefined ? new NamePool(this.workers) : name, param, callback, timeout);
  }
  private call_(name: N | NamePool<N>, param: P, callback: Supervisor.Callback<R> | number, timeout: number): AtomicPromise<R> | void {
    void this.throwErrorIfNotAvailable();
    if (typeof callback === 'number') return new AtomicPromise<R>((resolve, reject) =>
      void this.call_(name, param, (result, err) => err ? reject(err) : resolve(result), timeout));
    void this.messages.push([
      name,
      param,
      callback,
      Date.now() + timeout,
    ]);
    while (this.messages.length > this.settings.size) {
      const [name, param, callback] = this.messages.shift()!;
      const names = typeof name === 'string'
        ? [name]
        : [...name];
      void this.events_.loss.emit([names[0]], [names[0], param]);
      try {
        void callback(undefined as any, new Error(`Spica: Supervisor: <${this.id}/${this.name}>: A message overflowed.`));
      }
      catch (reason) {
        void causeAsyncException(reason);
      }
    }
    void this.schedule();
    if (timeout <= 0) return;
    if (timeout === Infinity) return;
    void setTimeout(() =>
      void this.schedule()
    , timeout + 3);
  }
  public cast(name: N | ('' extends N ? undefined : never), param: P, timeout = this.settings.timeout): boolean {
    const result = this.cast_(name === undefined ? new NamePool(this.workers) : name, param, timeout);
    if (result === undefined) return false;
    void result.catch(noop);
    return true;
  }
  private cast_(name: N | NamePool<N>, param: P, timeout: number): AtomicPromise<R> | undefined {
    void this.throwErrorIfNotAvailable();
    const names = typeof name === 'string'
      ? [name]
      : [...name];
    const result = names.reduce((result, name) => (
      result
        ? result
        : this.workers.has(name)
          ? this.workers.get(name)!.call([param, Date.now() + timeout])
          : undefined
    ), undefined);
    if (result === undefined) {
      void this.events_.loss.emit([names[0]], [names[0], param]);
    }
    return result;
  }
  public refs(name?: N): [N, Supervisor.Process<P, R, S>, S, (reason?: any) => boolean][] {
    void this.throwErrorIfNotAvailable();
    return name === undefined
      ? [...this.workers.values()].map(convert)
      : this.workers.has(name)
        ? [convert(this.workers.get(name)!)]
        : [];

    function convert(worker: Worker<N, P, R, S>): [N, Supervisor.Process<P, R, S>, S, (reason?: any) => boolean] {
      assert(worker instanceof Worker);
      return [
        worker.name,
        worker.process,
        worker.state,
        worker.terminate,
      ];
    }
  }
  public kill(name: N, reason?: any): boolean {
    if (!this.available) return false;
    assert(this.alive === true);
    return this.workers.has(name)
      ? this.workers.get(name)!.terminate(reason)
      : false;
  }
  public terminate(reason?: any): boolean {
    if (!this.available) return false;
    assert(this.alive === true);
    void this.destructor(reason);
    return true;
  }
  public schedule(): void {
    if (this.messages.length === 0) return;
    assert(this.available);
    void tick(this.scheduler, true);
  }
  private readonly scheduler = () => void (void 0, this.settings.scheduler)(this.deliver);
  private readonly messages: [N | NamePool<N>, P, Supervisor.Callback<R>, number][] = [];
  private readonly deliver = (): void => {
    const since = Date.now();
    for (let i = 0, len = this.messages.length; this.available && i < len; ++i) {
      if (this.settings.resource - (Date.now() - since) <= 0) return void this.schedule();
      const [name, param, callback, expiry] = this.messages[i];
      const names = typeof name === 'string'
        ? [name]
        : [...name];
      const result = names.reduce((result, name) => (
        result
          ? result
          : this.workers.has(name)
            ? this.workers.get(name)!.call([param, expiry])
            : undefined
      ), undefined);
      if (result === undefined && Date.now() < expiry) continue;
      i === 0
        ? void this.messages.shift()
        : void this.messages.splice(i, 1);
      void --i;
      void --len;

      if (result === undefined) {
        void this.events_.loss.emit([names[0]], [names[0], param]);
        try {
          void callback(undefined as any, new Error(`Spica: Supervisor: A process has failed.`));
        }
        catch (reason) {
          void causeAsyncException(reason);
        }
      }
      else {
        void result
          .then(
            reply =>
              void callback(reply),
            () =>
              void callback(undefined as any, new Error(`Spica: Supervisor: A process has failed.`)));
      }
    }
  }
}
export namespace Supervisor {
  export type Process<P, R, S> = {
    readonly init: Process.Init<S>;
    readonly main: Process.Main<P, R, S>;
    readonly exit: Process.Exit<S>;
  };
  export namespace Process {
    export type Init<S> = (state: S) => S;
    export type Main<P, R, S> = (param: P, state: S, kill: (reason?: any) => void) => Result<R, S> | PromiseLike<Result<R, S>>;
    export type Exit<S> = (reason: any, state: S) => void;
    export type Result<R, S> = [R, S] | { reply: R; state: S; };
  }
  export type Callback<R> = (reply: R, error?: Error) => void;
  export namespace Event {
    export namespace Data {
      export type Init<N extends string, P, R, S> = [N, Process<P, R, S>, S];
      export type Loss<N extends string, P> = [N, P];
      export type Exit<N extends string, P, R, S> = [N, Process<P, R, S>, S, any];
    }
  }
}

class NamePool<N extends string> implements Iterable<N> {
  constructor(
    private readonly workers: ReadonlyMap<N, any>,
  ) {
  }
  [Symbol.iterator](): IterableIterator<N> {
    return this.workers.size === 0
      ? ['' as N][Symbol.iterator]()
      : this.workers.keys();
  }
}

class Worker<N extends string, P, R, S> {
  constructor(
    private readonly sv: Supervisor<N, P, R, S>,
    public readonly name: N,
    public readonly process: Supervisor.Process<P, R, S>,
    public state: S,
    initiated: boolean,
    private readonly events: {
      readonly init: Publisher<[N], Supervisor.Event.Data.Init<N, P, R, S>, any>;
      readonly exit: Publisher<[N], Supervisor.Event.Data.Exit<N, P, R, S>, any>;
    },
    private readonly destructor_: () => void,
  ) {
    assert(process.init && process.exit);
    initiated && void this.init();
  }
  private destructor(reason: any): void {
    assert(this.alive === true);
    this.alive = false;
    this.available = false;
    void Object.freeze(this);
    assert(this.alive === false);
    assert(this.available === false);
    try {
      void this.destructor_();
    }
    catch (reason) {
      void causeAsyncException(reason);
    }
    if (this.initiated) {
      void this.exit(reason);
    }
  }
  private alive = true;
  private available = true;
  private initiated = false;
  private init(): void {
    assert(!this.initiated);
    this.initiated = true;
    void this.events.init
      .emit([this.name], [this.name, this.process, this.state]);
    this.state = this.process.init(this.state);
  }
  private exit(reason: any): void {
    assert(this.initiated);
    try {
      void this.process.exit(reason, this.state);
      void this.events.exit
        .emit([this.name], [this.name, this.process, this.state, reason]);
    }
    catch (reason_) {
      void this.events.exit
        .emit([this.name], [this.name, this.process, this.state, reason]);
      void this.sv.terminate(reason_);
    }
  }
  public call([param, expiry]: [P, number]): AtomicPromise<R> | undefined {
    const now = Date.now();
    if (!this.available || now > expiry) return;
    return new AtomicPromise<Supervisor.Process.Result<R, S>>((resolve, reject) => {
      isFinite(expiry) && void setTimeout(() => void reject(new Error()), expiry - now);
      this.available = false;
      if (!this.initiated) {
        void this.init();
      }
      void AtomicPromise.resolve(this.process.main(param, this.state, this.terminate)).then(resolve, reject);
    })
      .then(
        result => {
          const [reply, state] = Array.isArray(result)
            ? result
            : [result.reply, result.state];
          if (!this.alive) return reply;
          void this.sv.schedule();
          assert(!Object.isFrozen(this));
          this.state = state;
          this.available = true;
          return reply;
        })
      .catch(
        reason => {
          void this.sv.schedule();
          void this.terminate(reason);
          throw reason;
        });
  }
  public readonly terminate = (reason: any): boolean => {
    if (!this.alive) return false;
    void this.destructor(reason);
    return true;
  }
}
