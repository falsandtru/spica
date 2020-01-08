import { global } from './global';
import { AtomicPromise } from './promise';
import { AtomicFuture } from './future'; 
import type { DeepImmutable, DeepRequired } from './type';
import { extend } from './assign';
import { wait, tick } from './clock';
import { causeAsyncException } from './exception';
import { noop } from './noop';

const { Object: Obj, Error } = global;

export interface CoroutineOptions {
  readonly size?: number;
  readonly interval?: number;
  readonly resume?: () => PromiseLike<void> | void;
  readonly trigger?: string | symbol | ReadonlyArray<string | symbol>;
}

export interface CoroutineInterface<T = unknown, R = unknown, _ = unknown> extends Promise<T>, AsyncIterable<R> {
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
      while (true) {
        try {
          while (this.msgs.length > 0) {
            // Don't block.
            const [, reply] = this.msgs.shift()!;
            void reply(AtomicPromise.reject(new Error(`Spica: Coroutine: Canceled.`)));
          }
          return;
        }
        catch (reason) {
          void causeAsyncException(reason);
          continue;
        }
      }
    });
  }
  public alive = true;
  public state = new AtomicFuture<IteratorResult<R, undefined>>();
  public resume = new AtomicFuture<undefined>();
  public readonly result = new AtomicFuture<T>();
  public readonly msgs: [S | PromiseLike<S>, Reply<R, T>][] = [];
  public readonly settings: DeepImmutable<DeepRequired<CoroutineOptions>> = {
    size: 0,
    interval: 0,
    resume: () => undefined,
    trigger: undefined as any,
  };
}
type Reply<R, T> = (msg: IteratorResult<R, T> | PromiseLike<never>) => void;

const internal = Symbol.for('spica/coroutine::internal');

export interface Coroutine<T = unknown, R = unknown, S = unknown> extends AtomicPromise<T>, AsyncIterable<R> {
  constructor: typeof Coroutine;
}
export class Coroutine<T = unknown, R = unknown, S = unknown> extends AtomicPromise<T> implements Promise<T>, AsyncIterable<R>, CoroutineInterface<T, R, S> {
  public static readonly alive: typeof alive = alive;
  protected static readonly init: typeof init = init;
  public static readonly exit: typeof exit = exit;
  public static readonly terminate: typeof terminate = terminate;
  public static readonly port: typeof port = port;
  public static get [Symbol.species]() {
    return AtomicPromise;
  }
  constructor(
    gen: (this: Coroutine<T, R, S>) => Generator<R, T, S> | AsyncGenerator<R, T, S>,
    opts: CoroutineOptions = {},
  ) {
    super(resolve => res = resolve);
    var res!: (v: T | AtomicPromise<T>) => void;
    this[internal] = new Internal(opts);
    void res(this[internal].result);
    this[Coroutine.init] = async () => {
      let reply: Reply<R, T> = noop;
      try {
        this[Coroutine.init] = noop;
        if (!this[internal].alive) return;
        const resume = (): S | PromiseLike<S> =>
          this[internal].msgs.length > 0
            ? ([, reply] = this[internal].msgs.shift()!)[0]
            : this[internal].resume.then(resume);
        const iter = gen.call(this);
        let cnt = 0;
        while (this[internal].alive) {
          void ++cnt;
          const [msg] = cnt === 1
            // Don't block.
            ? [undefined]
            // Block.
            : await AtomicPromise.all([
                // Don't block.
                this[internal].settings.size === 0
                  ? undefined
                  : resume(),
                // Don't block.
                AtomicPromise.all([
                  this[internal].settings.resume(),
                  this[internal].settings.interval > 0
                    ? wait(this[internal].settings.interval)
                    : undefined,
                ]),
              ]);
          assert(msg instanceof Promise === false);
          assert(msg instanceof AtomicPromise === false);
          if (!this[internal].alive) break;
          // Block.
          // `value` can be Promise when using iterator.
          // `value` will never be Promise when using async iterator.
          const { value, done } = await iter.next(msg!);
          if (!this[internal].alive) break;
          if (!done) {
            const state = this[internal].state;
            this[internal].state = new AtomicFuture();
            // Don't block.
            void state.bind({ value: value as R, done });
            void [reply, reply = noop][0]({ value: value as R, done });
            continue;
          }
          else {
            this[internal].alive = false;
            // Don't block.
            void this[internal].state.bind({ value: undefined, done });
            // Block.
            this[internal].result.bind(value as T)
              .then(() =>
                void [reply, reply = noop][0]({ value: value as T, done }));
            return;
          }
        }
        assert(!this[internal].alive);
        void reply(AtomicPromise.reject(new Error(`Spica: Coroutine: Canceled.`)));
      }
      catch (reason) {
        void reply(AtomicPromise.reject(reason));
        void this[Coroutine.terminate](reason);
      }
    };
    if (this[internal].settings.trigger !== undefined) {
      for (const prop of Array<string | symbol>().concat(this[internal].settings.trigger)) {
        if (prop in this) continue;
        const desc = Obj.getOwnPropertyDescriptor(this, prop) || {
          value: this[prop],
          enumerable: true,
          configurable: true,
          writable: true,
        };
        void Obj.defineProperty(this, prop, {
          set(this: Coroutine, value: unknown) {
            void Obj.defineProperty(this, prop, { ...desc, value });
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
    void tick(() => void this[Coroutine.init]());
  }
  public readonly [internal]: Internal<T, R, S>;
  public get [alive](): boolean {
    return this[internal].alive;
  }
  public [init]: () => void;
  public [exit](result: T | PromiseLike<T>): void {
    if (!this[internal].alive) return;
    void this[init]();
    this[internal].alive = false;
    // Don't block.
    void this[internal].state.bind({ value: undefined, done: true });
    void this[internal].result.bind(result);
  }
  public [terminate](reason?: unknown): void {
    return this[exit](AtomicPromise.reject(reason));
  }
  public async *[Symbol.asyncIterator](): AsyncIterator<R, undefined, undefined> {
    void this[init]();
    while (this[internal].alive) {
      const { value } = await this[internal].state;
      if (!this[internal].alive) break;
      yield value!;
    }
    return this.then(() => undefined);
  }
  public readonly [port] = {
    recv: (): AtomicPromise<IteratorResult<R, T>> => {
      void this[init]();
      return this[internal].state
        .then(({ value, done }) =>
          done
            ? this.then(value => ({ value, done }))
            : { value: value!, done });
    },
    send: (msg: S | PromiseLike<S>): AtomicPromise<IteratorResult<R, T>> => {
      if (!this[internal].alive) return AtomicPromise.reject(new Error(`Spica: Coroutine: Canceled.`));
      void this[init]();
      const res = new AtomicFuture<IteratorResult<R, T>>();
      // Don't block.
      void this[internal].msgs.push([msg, res.bind]);
      void this[internal].resume.bind();
      this[internal].resume = new AtomicFuture();
      while (this[internal].msgs.length > this[internal].settings.size) {
        // Don't block.
        const [, reply] = this[internal].msgs.shift()!;
        void reply(AtomicPromise.reject(new Error(`Spica: Coroutine: Overflowed.`)));
      }
      return res.then();
    },
    connect: async <U>(com: (this: Coroutine<T, R, S>) => Generator<S, U, T | R> | AsyncGenerator<S, U, T | R>): Promise<U> => {
      void this[init]();
      const iter = com.call(this);
      let reply: T | R | undefined;
      while (true) {
        const { value, done } = await iter.next(reply!);
        if (done) return value as U;
        reply = (await this[port].send(value as S)).value;
      }
    },
  } as const;
}
Coroutine.prototype.then = function () {
  void this[init]();
  return Coroutine.prototype['__proto__'].then.call(this, ...arguments);
};
Coroutine.prototype.catch = function () {
  void this[init]();
  return Coroutine.prototype['__proto__'].catch.call(this, ...arguments);
};
Coroutine.prototype.finally = function () {
  void this[init]();
  return Coroutine.prototype['__proto__'].finally.call(this, ...arguments);
};

export function isCoroutine(target: unknown): target is CoroutineInterface<unknown, unknown, unknown> {
  return typeof target === 'object'
      && !!target
      && typeof target.constructor['exit'] === 'symbol'
      && typeof target[target.constructor['exit']] === 'function'
      && typeof target.constructor['terminate'] === 'symbol'
      && typeof target[target.constructor['terminate']] === 'function'
      && typeof target.constructor['port'] === 'symbol'
      && typeof target[target.constructor['port']] === 'object';
}
