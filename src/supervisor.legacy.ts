import { AtomicPromise } from './promise';
import { AtomicFuture } from './future';
import { Observation, Observer, Publisher } from './observation';
import { DeepImmutable, DeepRequired } from './type';
import { extend } from './assign';
import { tick } from './clock';
import { sqid } from './sqid';
import { noop } from './noop';
import { causeAsyncException } from './exception';

export interface SupervisorOptions {
  readonly name?: string;
  readonly size?: number;
  readonly timeout?: number;
  readonly destructor?: (reason: unknown) => void;
  readonly scheduler?: (cb: () => void) => void;
  readonly resource?: number;
}

export abstract class Supervisor<N extends string, P = unknown, R = unknown, S = unknown> extends AtomicPromise<undefined> {
  private static instances_: Set<Supervisor<string, unknown, unknown, unknown>>;
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
  public static clear(reason?: unknown): void {
    while (this.instances.size > 0) {
      for (const sv of this.instances) {
        void sv.terminate(reason);
      }
    }
  }
  protected static readonly standalone = new WeakSet<Supervisor.Process<unknown, unknown, unknown>>();
  constructor(opts: SupervisorOptions = {}) {
    super((resolve, reject) => (
      cb = [resolve, reject],
      state = new AtomicFuture(),
      { next: () => new AtomicPromise(r => r({ value: state, done: true })) }));
    var cb!: [() => void, () => void];
    var state!: AtomicFuture;
    void this.state.then(...cb);
    void state.bind(this.state);
    void extend(this.settings, opts);
    this.name = this.settings.name;
    if (this.constructor === Supervisor) throw new Error(`Spica: Supervisor: <${this.id}/${this.name}>: Cannot instantiate abstract classes.`);
    // @ts-ignore
    void (this.constructor as typeof Supervisor).instances.add(this);
  }
  protected readonly state = new AtomicFuture();
  private destructor(reason: unknown): void {
    assert(this.alive === true);
    assert(this.available === true);
    this.available = false;
    void this.clear(reason);
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
    // @ts-ignore
    void (this.constructor as typeof Supervisor).instances.delete(this);
    void Object.freeze(this);
    assert(this.alive === false);
    assert(this.available === false);
    void this.settings.destructor(reason);
    void this.state.bind(reason === undefined ? undefined : AtomicPromise.reject(reason));
  }
  public readonly id: string = sqid();
  public readonly name: string;
  private readonly settings: DeepImmutable<DeepRequired<SupervisorOptions>> = {
    name: '',
    size: Infinity,
    timeout: Infinity,
    destructor: (_: unknown) => undefined,
    scheduler: tick,
    resource: 10,
  };
  private readonly events_ = {
    init: new Observation<[N], Supervisor.Event.Data.Init<N, P, R, S>, unknown>(),
    loss: new Observation<[N], Supervisor.Event.Data.Loss<N, P>, unknown>(),
    exit: new Observation<[N], Supervisor.Event.Data.Exit<N, P, R, S>, unknown>(),
  };
  public readonly events: {
    readonly init: Observer<[N], Supervisor.Event.Data.Init<N, P, R, S>, unknown>;
    readonly loss: Observer<[N], Supervisor.Event.Data.Loss<N, P>, unknown>;
    readonly exit: Observer<[N], Supervisor.Event.Data.Exit<N, P, R, S>, unknown>;
  } = this.events_;
  private readonly workers = new Map<N, Worker<N, P, R, S>>();
  private alive = true;
  private available = true;
  private throwErrorIfNotAvailable(): void {
    if (!this.available) throw new Error(`Spica: Supervisor: <${this.id}/${this.name}>: A supervisor is already terminated.`);
  }
  public register(name: N, process: Supervisor.Process<P, R, S> | Supervisor.Process.Main<P, R, S>, state: S, reason?: unknown): (reason?: unknown) => boolean {
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
  public call(name: N | ('' extends N ? undefined | ((names: Iterable<N>) => Iterable<N>) : never), param: P, timeout?: number): AtomicPromise<R>;
  public call(name: N | ('' extends N ? undefined | ((names: Iterable<N>) => Iterable<N>) : never), param: P, callback: Supervisor.Callback<R>, timeout?: number): void;
  public call(name: N | ('' extends N ? undefined | ((names: Iterable<N>) => Iterable<N>) : never), param: P, callback: Supervisor.Callback<R> | number = this.settings.timeout, timeout = this.settings.timeout): AtomicPromise<R> | void {
    return this.call_(typeof name === 'string' ? name : new NamePool(this.workers, name), param, callback, timeout);
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
        : [name[Symbol.iterator]().next().value];
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
  public cast(name: N | ('' extends N ? undefined | ((names: Iterable<N>) => Iterable<N>) : never), param: P, timeout = this.settings.timeout): boolean {
    const result = this.cast_(typeof name === 'string' ? name : new NamePool(this.workers, name), param, timeout);
    if (result === undefined) return false;
    void result.catch(noop);
    return true;
  }
  private cast_(name: N | NamePool<N>, param: P, timeout: number): AtomicPromise<R> | undefined {
    void this.throwErrorIfNotAvailable();
    const names = typeof name === 'string'
      ? [name]
      : name;
    let result: AtomicPromise<R> | undefined;
    for (const name of names) {
      result = this.workers.has(name)
        ? this.workers.get(name)!.call([param, Date.now() + timeout])
        : undefined;
      if (result) break;
    }
    if (result === undefined) {
      const name = names[Symbol.iterator]().next().value;
      void this.events_.loss.emit([name], [name, param]);
    }
    return result;
  }
  public refs(name?: N): [N, Supervisor.Process<P, R, S>, S, (reason?: unknown) => boolean][] {
    void this.throwErrorIfNotAvailable();
    return name === undefined
      ? [...this.workers.values()].map(convert)
      : this.workers.has(name)
        ? [convert(this.workers.get(name)!)]
        : [];

    function convert(worker: Worker<N, P, R, S>): [N, Supervisor.Process<P, R, S>, S, (reason?: unknown) => boolean] {
      assert(worker instanceof Worker);
      return [
        worker.name,
        worker.process,
        worker.state,
        worker.terminate,
      ];
    }
  }
  public kill(name: N, reason?: unknown): boolean {
    if (!this.available) return false;
    assert(this.alive === true);
    return this.workers.has(name)
      ? this.workers.get(name)!.terminate(reason)
      : false;
  }
  public clear(reason?: unknown): void {
    while (this.workers.size > 0) {
      for (const [, worker] of this.workers) {
        void worker.terminate(reason);
      }
    }
  }
  public terminate(reason?: unknown): boolean {
    if (!this.available) return false;
    assert(this.alive === true);
    void this.destructor(reason);
    return true;
  }
  public schedule(): void {
    if (this.scheduled) return;
    if (this.messages.length === 0) return;
    assert(this.available);
    void tick(this.scheduler);
    this.scheduled = true;
  }
  private scheduled = false;
  private readonly scheduler = () => void (void 0, this.settings.scheduler)(this.deliver);
  private readonly messages: [N | NamePool<N>, P, Supervisor.Callback<R>, number][] = [];
  private readonly deliver = (): void => {
    this.scheduled = false;
    const since = Date.now();
    for (let i = 0, len = this.messages.length; this.available && i < len; ++i) {
      if (this.settings.resource - (Date.now() - since) <= 0) return void this.schedule();
      const [name, param, callback, expiry] = this.messages[i];
      const names = typeof name === 'string'
        ? [name]
        : name;
      let result: AtomicPromise<R> | undefined;
      for (const name of names) {
        result = this.workers.has(name)
          ? this.workers.get(name)!.call([param, expiry])
          : undefined;
        if (result) break;
      }
      if (result === undefined && Date.now() < expiry) continue;
      i === 0
        ? void this.messages.shift()
        : void this.messages.splice(i, 1);
      void --i;
      void --len;

      if (result === undefined) {
        const name = names[Symbol.iterator]().next().value;
        void this.events_.loss.emit([name], [name, param]);
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
    export type Main<P, R, S> = (param: P, state: S, kill: (reason?: unknown) => void) => Result<R, S> | PromiseLike<Result<R, S>>;
    export type Exit<S> = (reason: unknown, state: S) => void;
    export type Result<R, S> = [R, S] | { reply: R; state: S; };
  }
  export type Callback<R> = (reply: R, error?: Error) => void;
  export namespace Event {
    export namespace Data {
      export type Init<N extends string, P, R, S> = [N, Process<P, R, S>, S];
      export type Loss<N extends string, P> = [N, P];
      export type Exit<N extends string, P, R, S> = [N, Process<P, R, S>, S, unknown];
    }
  }
}

class NamePool<N extends string> implements Iterable<N> {
  constructor(
    private readonly workers: ReadonlyMap<N, unknown>,
    private readonly selector: (names: Iterable<N>) => Iterable<N> = ns => ns,
  ) {
    assert([...this].length > 0);
  }
  *[Symbol.iterator](): IterableIterator<N> {
    let cnt = 0;
    for (const name of this.selector(this.workers.keys())) {
      void ++cnt;
      yield name;
    }
    if (cnt === 0) {
      yield '' as N;
    }
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
      readonly init: Publisher<[N], Supervisor.Event.Data.Init<N, P, R, S>, unknown>;
      readonly exit: Publisher<[N], Supervisor.Event.Data.Exit<N, P, R, S>, unknown>;
    },
    private readonly destructor_: () => void,
  ) {
    assert(process.init && process.exit);
    initiated && void this.init();
  }
  private destructor(reason: unknown): void {
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
  private exit(reason: unknown): void {
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
          if (this.alive) {
            void this.sv.schedule();
            assert(!Object.isFrozen(this));
            this.state = state;
            this.available = true;
          }
          return reply;
        })
      .catch(
        reason => {
          void this.sv.schedule();
          void this.terminate(reason);
          throw reason;
        });
  }
  public readonly terminate = (reason: unknown): boolean => {
    if (!this.alive) return false;
    void this.destructor(reason);
    return true;
  }
}
