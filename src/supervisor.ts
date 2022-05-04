import type { DeepImmutable, DeepRequired } from './type';
import { Infinity, Symbol, Object, Set, Map, WeakSet, setTimeout, clearTimeout, Error } from './global';
import { isFinite, ObjectAssign, ObjectFreeze } from './alias';
import { tick } from './clock';
import { Coroutine, CoroutineInterface, isCoroutine } from './coroutine';
import { AtomicPromise } from './promise';
import { AtomicFuture } from './future';
import { Observation, Observer, Publisher } from './observer';
import { splice } from './array';
import { causeAsyncException } from './exception';
import { noop } from './noop';

export interface SupervisorOptions {
  readonly name?: string;
  readonly capacity?: number;
  readonly timeout?: number;
  readonly destructor?: (reason: unknown) => void;
  readonly scheduler?: (cb: () => void) => void;
  readonly resource?: number;
}

export interface Supervisor<N extends string = string, P = undefined, R = P, S = undefined> extends Coroutine<undefined, undefined, undefined> {
  // #36218
  constructor: typeof Supervisor & typeof Coroutine;
}
export abstract class Supervisor<N extends string, P = undefined, R = P, S = undefined> extends Coroutine<undefined, undefined, undefined> {
  private static instances_: Set<Supervisor<string, unknown, unknown, unknown>>;
  private static get instances() {
    return this.hasOwnProperty('instances_')
      ? this.instances_
      : this.instances_ = new Set();
  }
  private static status_: {
    readonly instances: number;
    readonly processes: number;
  };
  public static get status() {
    if (this.hasOwnProperty('status_')) return this.status_;
    const { instances } = this;
    return this.status_ = {
      get instances(): number {
        return instances.size;
      },
      get processes(): number {
        return [...instances]
          .reduce((acc, sv) =>
            acc + sv.workers.size
          , 0);
      },
    } as const;
  }
  public static clear(reason?: unknown): void {
    while (this.instances.size > 0) {
      for (const sv of this.instances) {
        void sv.terminate(reason);
      }
    }
  }
  protected static readonly standalone = new WeakSet<Supervisor.Process.Regular<unknown, unknown, unknown>>();
  constructor(opts: SupervisorOptions = {}) {
    super(async function* (this: Supervisor<N, P, R, S>) {
      return this.state;
    }, { delay: false });
    ObjectAssign(this.settings, opts);
    this.name = this.settings.name;
    // FIXME: Remove the next type assertion after #37383 is fixed.
    if (this.constructor === Supervisor as any) throw new Error(`Spica: Supervisor: <${this.name}>: Cannot instantiate abstract classes.`);
    // @ts-ignore #31251
    void this.constructor.instances.add(this);
  }
  private readonly state = new AtomicFuture();
  private destructor(reason: unknown): void {
    assert(this.isAlive === true);
    assert(this.available === true);
    this.available = false;
    void this.clear(reason);
    assert(this.workers.size === 0);
    void ObjectFreeze(this.workers);
    while (this.messages.length > 0) {
      const [names, param, , , timer] = this.messages.shift()!;
      const name: N | undefined = names[Symbol.iterator]().next().value;
      timer && void clearTimeout(timer);
      void this.events_?.loss.emit([name], [name, param]);
    }
    assert(this.messages.length === 0);
    assert(!Object.isFrozen(this.messages));
    this.isAlive = false;
    // @ts-ignore #31251
    void this.constructor.instances.delete(this);
    void ObjectFreeze(this);
    assert(this.isAlive === false);
    assert(this.available === false);
    void this.settings.destructor(reason);
    void this.state.bind(reason === void 0 ? void 0 : AtomicPromise.reject(reason));
  }
  public readonly name: string;
  private readonly settings: DeepImmutable<DeepRequired<SupervisorOptions>> = {
    name: '',
    capacity: Infinity,
    timeout: Infinity,
    destructor: noop,
    scheduler: tick,
    resource: 10,
  };
  private events_?: {
    readonly init: Observation<[N], Supervisor.Event.Data.Init<N, P, R, S>, unknown>;
    readonly exit: Observation<[N], Supervisor.Event.Data.Exit<N, P, R, S>, unknown>;
    readonly loss: Observation<[N | undefined], Supervisor.Event.Data.Loss<N, P>, unknown>;
  };
  public get events(): {
    readonly init: Observer<[N], Supervisor.Event.Data.Init<N, P, R, S>, unknown>;
    readonly exit: Observer<[N], Supervisor.Event.Data.Exit<N, P, R, S>, unknown>;
    readonly loss: Observer<[N | undefined], Supervisor.Event.Data.Loss<N, P>, unknown>;
  } {
    return this.events_ ??= {
      init: new Observation<[N], Supervisor.Event.Data.Init<N, P, R, S>, unknown>(),
      exit: new Observation<[N], Supervisor.Event.Data.Exit<N, P, R, S>, unknown>(),
      loss: new Observation<[N | undefined], Supervisor.Event.Data.Loss<N, P>, unknown>(),
    };
  }
  private readonly workers = new Map<N, Worker<N, P, R, S>>();
  private isAlive = true;
  private available = true;
  private throwErrorIfNotAvailable(): void {
    if (!this.available) throw new Error(`Spica: Supervisor: <${this.name}>: Cannot use terminated supervisors.`);
  }
  // Workaround for #36053
  public register(this: Supervisor<N, P, R, undefined>, name: N, process: Supervisor.Process.Function<P, R, S>, state?: S): (reason?: unknown) => boolean;
  public register(name: N, process: Supervisor.Process.Function<P, R, S>, state: S): (reason?: unknown) => boolean;
  public register(this: Supervisor<N, P, R, undefined>, name: N, process: Supervisor.Process.GeneratorFunction<P, R, S>, state?: S): (reason?: unknown) => boolean;
  public register(name: N, process: Supervisor.Process.GeneratorFunction<P, R, S>, state: S): (reason?: unknown) => boolean;
  public register(this: Supervisor<N, P, R, undefined>, name: N, process: Supervisor.Process.AsyncGeneratorFunction<P, R, S>, state?: S): (reason?: unknown) => boolean;
  public register(name: N, process: Supervisor.Process.AsyncGeneratorFunction<P, R, S>, state: S): (reason?: unknown) => boolean;
  public register(name: N, process: Supervisor.Process.Coroutine<P, R>, state?: never): (reason?: unknown) => boolean;
  public register(name: N, process: Supervisor.Process<P, R, S>, state: S): (reason?: unknown) => boolean;
  public register(name: N, process: Supervisor.Process<P, R, S>, state?: S): (reason?: unknown) => boolean {
    state = state!;
    void this.throwErrorIfNotAvailable();
    if (isCoroutine(process)) {
      const port = process[process.constructor.port] as Coroutine<R, R, P>[typeof Coroutine.port];
      const proc: Supervisor.Process.Regular<P, R, S> = {
        init: state => state,
        main: (param, state, kill) =>
          port.ask(param)
            .then(({ value: reply, done }) =>
              done && void kill() || [reply, state]),
        exit: reason => void process[process.constructor.terminate](reason),
      };
      void this.constructor.standalone.add(proc);
      const kill = this.register(name, proc, state);
      void process.catch(kill);
      return kill;
    }
    if (isAsyncGeneratorFunction(process)) {
      let iter: AsyncGenerator<R, R, P>;
      return this.register(
        name,
        {
          init: (state, kill) => (iter = process(state, kill), void iter.next().catch(kill), state),
          main: (param, state, kill) =>
            AtomicPromise.resolve(iter.next(param))
              .then(({ value: reply, done }) =>
                done && void kill() || [reply, state]),
          exit: noop,
        },
        state);
    }
    if (typeof process === 'function') {
      if (isGeneratorFunction(process)) {
        let iter: Generator<R, R, P>;
        return this.register(
          name,
          {
            init: (state, kill) => (iter = process(state, kill), void iter.next(), state),
            main: (param, state, kill) => {
              const { value: reply, done } = iter.next(param);
              done && kill();
              return [reply, state];
            },
            exit: noop,
          },
          state);
      }
      return this.register(
        name,
        {
          init: state => state,
          main: process,
          exit: noop,
        },
        state);
    }
    if (this.workers.has(name)) throw new Error(`Spica: Supervisor: <${this.name}/${name}>: Cannot register another process with tha same name.`);
    void this.schedule();
    const worker: Worker<N, P, R, S> = new Worker(
      name,
      process,
      state,
      this,
      () => void this.schedule(),
      this.constructor.standalone.has(process),
      this.events_,
      () =>
        this.workers.get(name) === worker &&
        void this.workers.delete(name));
    void this.workers.set(name, worker);
    return worker.terminate;

    function isAsyncGeneratorFunction(process: Supervisor.Process<P, R, S>): process is Supervisor.Process.AsyncGeneratorFunction<P, R, S> {
      return process[Symbol.toStringTag] === 'AsyncGeneratorFunction';
    }

    function isGeneratorFunction(process: Supervisor.Process<P, R, S>): process is Supervisor.Process.GeneratorFunction<P, R, S> {
      return process[Symbol.toStringTag] === 'GeneratorFunction';
    }
  }
  public call(name: N | ((names: Iterable<N>) => Iterable<N>), param: P, timeout?: number): AtomicPromise<R>;
  public call(name: N | ((names: Iterable<N>) => Iterable<N>), param: P, callback: Supervisor.Callback<R>, timeout?: number): void;
  public call(name: N | ((names: Iterable<N>) => Iterable<N>), param: P, callback?: Supervisor.Callback<R> | number, timeout = this.settings.timeout): AtomicPromise<R> | void {
    if (typeof callback !== 'function') return new AtomicPromise<R>((resolve, reject) =>
      void this.call(name, param, (err, result) => err ? reject(err) : resolve(result), callback));
    void this.throwErrorIfNotAvailable();
    void this.messages.push([typeof name === 'string' ? [name] : new NamePool(this.workers, name),
      param,
      callback,
      Date.now() + timeout,
      0,
    ]);
    while (this.messages.length > (this.available ? this.settings.capacity : 0)) {
      const [names, param, callback, , timer] = this.messages.shift()!;
      timer && void clearTimeout(timer);
      const name: N | undefined = names[Symbol.iterator]().next().value;
      void this.events_?.loss.emit([name], [name, param]);
      try {
        void callback(new Error(`Spica: Supervisor: <${this.name}>: Message overflowed.`), void 0);
      }
      catch (reason) {
        void causeAsyncException(reason);
      }
    }
    if (this.messages.length === 0) return;
    void this.throwErrorIfNotAvailable();
    void this.schedule();
    if (timeout > 0 && timeout !== Infinity) {
      assert(this.messages[this.messages.length - 1][4] === 0);
      this.messages[this.messages.length - 1][4] = setTimeout(() =>
        void this.schedule()
      , timeout + 3);
    }
  }
  public cast(name: N | ((names: Iterable<N>) => Iterable<N>), param: P, timeout = this.settings.timeout): AtomicPromise<R> | undefined {
    void this.throwErrorIfNotAvailable();
    const expire = Date.now() + timeout;
    let result: AtomicPromise<R> | undefined;
    for (name of typeof name === 'string' ? [name] : new NamePool(this.workers, name)) {
      if (result = this.workers.get(name)?.call([param, expire])) break;
    }
    if (result) return result;
    const n = typeof name === 'string' ? name : void 0;
    void this.events_?.loss.emit([n], [n, param]);
  }
  public refs(name?: N): [N, Supervisor.Process.Regular<P, R, S>, S, (reason?: unknown) => boolean][] {
    assert(this.available || this.workers.size === 0);
    return name === void 0
      ? [...this.workers.values()].map(convert)
      : this.workers.has(name)
        ? [convert(this.workers.get(name)!)]
        : [];

    function convert(worker: Worker<N, P, R, S>): [N, Supervisor.Process.Regular<P, R, S>, S, (reason?: unknown) => boolean] {
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
    assert(this.isAlive === true);
    return this.workers.has(name)
      ? this.workers.get(name)!.terminate(reason)
      : false;
  }
  public clear(reason?: unknown): void {
    while (this.workers.size > 0) {
      for (const worker of this.workers.values()) {
        void worker.terminate(reason);
      }
    }
  }
  public terminate(reason?: unknown): boolean {
    if (!this.available) return false;
    assert(this.isAlive === true);
    void this.destructor(reason);
    void this[Coroutine.exit](void 0);
    return true;
  }
  public override [Coroutine.terminate](reason?: unknown): void {
    void this.terminate(reason);
  }
  public override [Coroutine.port] = {
    ask: () => { throw new Error(`Spica: Supervisor: <${this.name}>: Cannot use coroutine port.`); },
    recv: () => { throw new Error(`Spica: Supervisor: <${this.name}>: Cannot use coroutine port.`); },
    send: () => { throw new Error(`Spica: Supervisor: <${this.name}>: Cannot use coroutine port.`); },
    connect: () => { throw new Error(`Spica: Supervisor: <${this.name}>: Cannot use coroutine port.`); },
  } as const;
  private scheduled = false;
  private schedule(): void {
    if (!this.available || this.scheduled || this.messages.length === 0) return;
    this.scheduled = true;
    const p = new AtomicFuture(false);
    void p.finally(() => {
      this.scheduled = false;
      void this.deliver();
    });
    void this.settings.scheduler.call(void 0, p.bind);
    this.settings.scheduler === global.requestAnimationFrame && void setTimeout(p.bind, 1000);
  }
  // Bug: Karma and TypeScript
  private readonly messages: [Iterable<N>, P, Supervisor.Callback<R>, number, ReturnType<typeof setTimeout> | 0][] = [];
  private deliver(): void {
    if (!this.available) return;
    assert(!this.scheduled);
    const since = Date.now();
    for (let i = 0, len = this.messages.length; this.available && i < len; ++i) {
      if (this.settings.resource - (Date.now() - since) <= 0) return void this.schedule();
      const [names, param, callback, expiry, timer] = this.messages[i];
      let result: AtomicPromise<R> | undefined;
      let name: N | undefined;
      for (name of typeof names === 'string' ? [names] : names) {
        if (Date.now() > expiry) break;
        if (result = this.workers.get(name)?.call([param, expiry])) break;
      }
      if (!result && Date.now() < expiry) continue;
      void splice(this.messages, i, 1);
      void --i;
      void --len;
      timer && void clearTimeout(timer);

      if (result) {
        void result.then(
          reply =>
            void callback(void 0, reply),
          () =>
            void callback(new Error(`Spica: Supervisor: <${this.name}>: Process failed.`), void 0));
      }
      else {
        void this.events_?.loss.emit([name], [name, param]);
        try {
          void callback(new Error(`Spica: Supervisor: <${this.name}>: Message expired.`), void 0);
        }
        catch (reason) {
          void causeAsyncException(reason);
        }
      }
    }
  }
}
export namespace Supervisor {
  export type Process<P, R = P, S = undefined> =
    | Process.Regular<P, R, S>
    | Process.Function<P, R, S>
    | Process.GeneratorFunction<P, R, S>
    | Process.AsyncGeneratorFunction<P, R, S>
    | Process.Coroutine<P, R>;
  export namespace Process {
    export type Regular<P, R, S> = {
      readonly init: (state: S, kill: (reason?: unknown) => void) => S;
      readonly main: Function<P, R, S>;
      readonly exit: (reason: unknown, state: S) => void;
    };
    export type Function<P, R, S> = (param: P, state: S, kill: (reason?: unknown) => void) => Result<R, S> | PromiseLike<Result<R, S>>;
    export type GeneratorFunction<P, R, S> = (state: S, kill: (reason?: unknown) => void) => global.Generator<R, R, P>;
    export type AsyncGeneratorFunction<P, R, S> = (state: S, kill: (reason?: unknown) => void) => global.AsyncGenerator<R, R, P>;
    export type Coroutine<P, R> = CoroutineInterface<R, R, P>;
    export type Result<R, S> = readonly [R, S];
  }
  export type Callback<R> = (...args: [error: undefined, reply: R] | [error: Error, reply: undefined]) => void;
  export namespace Event {
    export namespace Data {
      export type Init<N extends string, P, R, S> = readonly [N, Process.Regular<P, R, S>, S];
      export type Exit<N extends string, P, R, S> = readonly [N, Process.Regular<P, R, S>, S, unknown];
      export type Loss<N extends string, P> = readonly [N | undefined, P];
    }
  }
}

class NamePool<N extends string> implements Iterable<N> {
  constructor(
    private readonly workers: ReadonlyMap<N, unknown>,
    private readonly selector: (names: Iterable<N>) => Iterable<N>,
  ) {
  }
  public [Symbol.iterator](): Iterator<N, undefined, undefined> {
    return this.selector(this.workers.keys())[Symbol.iterator]();
  }
}

class Worker<N extends string, P, R, S> {
  constructor(
    public readonly name: N,
    public readonly process: Supervisor.Process.Regular<P, R, S>,
    public state: S,
    private readonly sv: Supervisor<N, P, R, S>,
    private readonly schedule: () => void,
    initiated: boolean,
    private readonly events: {
      readonly init: Publisher<[N], Supervisor.Event.Data.Init<N, P, R, S>, unknown>;
      readonly exit: Publisher<[N], Supervisor.Event.Data.Exit<N, P, R, S>, unknown>;
    } | undefined,
    private readonly destructor_: () => void,
  ) {
    initiated && void this.init();
  }
  private destructor(reason: unknown): void {
    assert(this.isAlive === true);
    this.isAlive = false;
    this.available = false;
    void ObjectFreeze(this);
    assert(this.isAlive === false);
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
  private isAlive = true;
  private available = true;
  private initiated = false;
  private init(): void {
    assert(!this.initiated);
    this.initiated = true;
    void this.events?.init
      .emit([this.name], [this.name, this.process, this.state]);
    this.state = this.process.init(this.state, this.terminate);
  }
  private exit(reason: unknown): void {
    assert(this.initiated);
    try {
      void this.process.exit(reason, this.state);
      void this.events?.exit
        .emit([this.name], [this.name, this.process, this.state, reason]);
    }
    catch (reason_) {
      void this.events?.exit
        .emit([this.name], [this.name, this.process, this.state, reason]);
      void this.sv.terminate(reason_);
    }
  }
  public call([param, expiry]: [P, number]): AtomicPromise<R> | undefined {
    if (!this.available) return;
    return new AtomicPromise<Supervisor.Process.Result<R, S>>((resolve, reject) => {
      isFinite(expiry) && void setTimeout(() => void reject(new Error()), expiry - Date.now());
      assert(this.isAlive);
      assert(this.available);
      this.available = false;
      if (!this.initiated) {
        void this.init();
        if (!this.isAlive) return void reject();
      }
      assert(this.isAlive);
      assert(!this.available);
      void AtomicPromise.resolve(this.process.main(param, this.state, this.terminate))
        .then(resolve, reject);
    })
      .then(([reply, state]) => {
        if (this.isAlive) {
          void this.schedule();
          assert(!Object.isFrozen(this));
          this.state = state;
          this.available = true;
        }
        return reply;
      })
      .catch(reason => {
        void this.schedule();
        void this.terminate(reason);
        throw reason;
      });
  }
  public readonly terminate = (reason: unknown): boolean => {
    if (!this.isAlive) return false;
    void this.destructor(reason);
    return true;
  };
}
