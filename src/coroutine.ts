import { Array, Promise, Error } from './global';
import { ObjectDefineProperty, ObjectGetOwnPropertyDescriptor } from './alias';
import { AtomicPromise, isPromiseLike } from './promise';
import { AtomicFuture } from './future';
import type { Structural, DeepImmutable, DeepRequired } from './type';
import { extend } from './assign';
import { wait, tick } from './clock';
import { causeAsyncException } from './exception';
import { noop } from './noop';

export interface CoroutineOptions {
  readonly autorun?: boolean;
  readonly debug?: boolean;
  readonly size?: number;
  readonly interval?: number;
  readonly resume?: () => PromiseLike<void> | void;
  readonly trigger?: string | symbol | ReadonlyArray<string | symbol>;
}

export interface CoroutineInterface<T = unknown, R = T, _ = unknown> extends Promise<T>, AsyncIterable<R> {
  readonly constructor: {
    readonly alive: symbol;
    readonly exit: symbol;
    readonly terminate: symbol;
    readonly port: symbol;
    readonly [Symbol.species]: typeof Promise;
  };
}

const alive = Symbol.for('spica/Coroutine.alive');
const init = Symbol.for('spica/Coroutine.init');
const exit = Symbol.for('spica/Coroutine.exit');
const terminate = Symbol.for('spica/Coroutine.terminate');
const port = Symbol.for('spica/Coroutine.port');

class Internal<T, R, S> {
  constructor(opts: CoroutineOptions) {
    void extend(this.settings, opts);
    void this.result.finally(() => {
      while (this.msgs.length > 0) {
        // Don't block.
        const [, reply] = this.msgs.shift()!;
        try {
          void reply(AtomicPromise.reject(new Error(`Spica: Coroutine: Canceled.`)));
        }
        catch (reason) {
          void causeAsyncException(reason);
        }
      }
    });
  }
  public alive = true;
  public state = new AtomicFuture<IteratorResult<R, unknown>>();
  public resume = new AtomicFuture<undefined>();
  public readonly result = new AtomicFuture<{ value: T }>();
  public readonly msgs: [S, Reply<R, T>][] = [];
  public readonly settings: DeepImmutable<DeepRequired<CoroutineOptions>> = {
    autorun: true,
    debug: false,
    size: 0,
    interval: 0,
    resume: () => void 0,
    trigger: void 0 as any,
  };
}
type Reply<R, T> = (msg: IteratorResult<R, T> | PromiseLike<never>) => void;

const internal = Symbol.for('spica/coroutine::internal');

export interface Coroutine<T = unknown, R = T, S = unknown> extends AtomicPromise<T>, AsyncIterable<R> {
  constructor: typeof Coroutine;
}
export class Coroutine<T = unknown, R = T, S = unknown> extends AtomicPromise<T> implements Promise<T>, AsyncIterable<R>, CoroutineInterface<T, R, S> {
  public static readonly alive: typeof alive = alive;
  protected static readonly init: typeof init = init;
  public static readonly exit: typeof exit = exit;
  public static readonly terminate: typeof terminate = terminate;
  public static readonly port: typeof port = port;
  constructor(
    gen: (this: Coroutine<T, R, S>) => AsyncGenerator<R, T, S>,
    opts: CoroutineOptions = {},
  ) {
    super(resolve => res = resolve);
    var res!: (v: T | AtomicPromise<T>) => void;
    this[internal] = new Internal(opts);
    this[port] = new Port(this, () => void this[Coroutine.init]());
    const core = this[internal];
    void res(core.result.then(({ value }) => value));
    let cnt = 0;
    this[Coroutine.init] = async () => {
      if (cnt !== 0) return;
      const core = this[internal];
      let reply: Reply<R, T> = noop;
      try {
        if (!core.alive) return;
        const resume = (): [S] | PromiseLike<[S]> =>
          core.msgs.length > 0
            ? [([, reply] = core.msgs.shift()!)[0]]
            : core.resume.then(resume);
        const iter = gen.call(this);
        while (core.alive) {
          void ++cnt;
          const [[msg]] = cnt === 1
            // Don't block.
            ? [[void 0]]
            // Block.
            : await Promise.all([
                // Don't block.
                core.settings.size === 0
                  ? [void 0]
                  : resume(),
                // Don't block.
                Promise.all([
                  core.settings.resume(),
                  core.settings.interval > 0
                    ? wait(core.settings.interval)
                    : void 0,
                ]),
              ]);
          assert(msg instanceof Promise === false);
          assert(msg instanceof AtomicPromise === false);
          if (!core.alive) break;
          // Block.
          // `result.value` can be a Promise value when using iterators.
          // `result.value` will never be a Promise value when using async iterators.
          const result = await iter.next(msg!);
          assert(!isPromiseLike(result.value));
          if (!result.done) {
            // Don't block.
            void reply({ ...result });
            void core.state.bind(result);
            core.state = new AtomicFuture();
            continue;
          }
          else {
            // Don't block.
            core.alive = false;
            void reply({ ...result });
            void core.state.bind(result);
            void core.result.bind(result);
            return;
          }
        }
        assert(!core.alive);
        void reply(AtomicPromise.reject(new Error(`Spica: Coroutine: Canceled.`)));
      }
      catch (reason) {
        void reply(AtomicPromise.reject(reason));
        void this[Coroutine.terminate](reason);
      }
    };
    if (core.settings.trigger !== void 0) {
      for (const prop of Array<string | symbol>().concat(core.settings.trigger)) {
        if (prop in this && this.hasOwnProperty(prop)) continue;
        if (prop in this) {
          void ObjectDefineProperty(this, prop, {
            set(this: Coroutine, value: unknown) {
              delete this[prop];
              this[prop] = value;
              void this[init]();
            },
            get(this: Coroutine) {
              delete this[prop];
              void this[init]();
              return this[prop];
            },
            enumerable: true,
            configurable: true,
          });
        }
        else {
          const desc = ObjectGetOwnPropertyDescriptor(this, prop) || {
            value: this[prop],
            enumerable: true,
            configurable: true,
            writable: true,
          };
          void ObjectDefineProperty(this, prop, {
            set(this: Coroutine, value: unknown) {
              void ObjectDefineProperty(this, prop, { ...desc, value });
              void this[init]();
            },
            get(this: Coroutine) {
              return this[prop];
            },
            enumerable: true,
            configurable: true,
          });
        }
      }
    }
    this[internal].settings.debug && void this[Coroutine.init]();
    this[internal].settings.autorun && void tick(this[Coroutine.init]);
  }
  public readonly [internal]: Internal<T, R, S>;
  public get [alive](): boolean {
    return this[internal].alive;
  }
  public readonly [init]: () => void;
  public [exit](result: T | PromiseLike<T>): void {
    if (!this[internal].alive) return;
    void AtomicPromise.resolve(result)
      .then(
        result => {
          const core = this[internal];
          if (!core.alive) return;
          core.alive = false;
          // Don't block.
          void core.state.bind({ value: void 0, done: true });
          void core.result.bind({ value: result });
        },
        reason => {
          const core = this[internal];
          if (!core.alive) return;
          core.alive = false;
          // Don't block.
          void core.state.bind({ value: void 0, done: true });
          void core.result.bind(AtomicPromise.reject(reason));
        });
  }
  public [terminate](reason?: unknown): void {
    return this[exit](AtomicPromise.reject(reason));
  }
  public async *[Symbol.asyncIterator](): AsyncIterator<R, T, undefined> {
    const core = this[internal];
    while (core.alive) {
      const state = await core.state;
      if (state.done) break;
      yield state.value;
    }
    return this;
  }
  public readonly [port]: Structural<Port<T, R, S>>;
}

// All responses will be deferred.
class Port<T, R, S> {
  constructor(
    co: Coroutine<T, R, S>,
    init: () => void,
  ) {
    this[internal] = {
      co,
      init,
    };
  }
  public readonly [internal]: {
    readonly co: Coroutine<T, R, S>;
    readonly init: () => void;
  };
  public recv(): AtomicPromise<IteratorResult<R, T>> {
    const core = this[internal].co[internal];
    if (!core.alive) return AtomicPromise.reject(new Error(`Spica: Coroutine: Canceled.`));
    void this[internal].init();
    return core.state
      .then(async state =>
        state.done
          ? core.result.then(({ value }) => ({ value, done: state.done }))
          : { ...state });
  }
  public send(msg: S): AtomicPromise<IteratorResult<R, T>> {
    const core = this[internal].co[internal];
    if (!core.alive) return AtomicPromise.reject(new Error(`Spica: Coroutine: Canceled.`));
    void this[internal].init();
    if (core.settings.size === 0) return AtomicPromise.reject(new Error(`Spica: Coroutine: Overflowed.`));
    const res = new AtomicFuture<IteratorResult<R, T>>();
    // Don't block.
    void core.msgs.push([msg, res.bind]);
    void core.resume.bind();
    core.resume = new AtomicFuture();
    while (core.msgs.length > core.settings.size) {
      // Don't block.
      const [, reply] = core.msgs.shift()!;
      void reply(AtomicPromise.reject(new Error(`Spica: Coroutine: Overflowed.`)));
    }
    return res.then(async r => r);
  }
  public async connect<U>(com: (this: Coroutine<T, R, S>) => AsyncGenerator<S, U, R | T>): Promise<U> {
    if (!this[internal].co[internal].alive) return AtomicPromise.reject(new Error(`Spica: Coroutine: Canceled.`));
    void this[internal].init();
    const iter = com.call(this[internal].co);
    let reply: R | T | undefined;
    while (true) {
      const result = await iter.next(reply!);
      if (result.done) return result.value;
      reply = (await this.send(result.value)).value;
    }
  }
}

export function isCoroutine(target: unknown): target is CoroutineInterface<unknown, unknown, unknown> {
  return typeof target === 'object'
      && target !== null
      && typeof target.constructor === 'function'
      && typeof target.constructor['alive'] === 'symbol'
      && typeof target[target.constructor['alive']] === 'boolean'
      && typeof target.constructor['init'] === 'symbol'
      && typeof target[target.constructor['init']] === 'function'
      && typeof target.constructor['exit'] === 'symbol'
      && typeof target[target.constructor['exit']] === 'function'
      && typeof target.constructor['terminate'] === 'symbol'
      && typeof target[target.constructor['terminate']] === 'function'
      && typeof target.constructor['port'] === 'symbol'
      && typeof target[target.constructor['port']] === 'object';
}
