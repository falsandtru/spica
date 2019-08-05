import { AtomicPromise } from './promise';
import { AtomicFuture } from './future'; 
import { DeepImmutable, DeepRequired } from './type';
import { extend } from './assign';
import { clock, wait, tick } from './clock';
import { noop } from './noop';

const status = Symbol();
const run = Symbol();
const port = Symbol();
const terminate = Symbol();

export interface CoroutineOptions {
  readonly size?: number;
  readonly interval?: number;
  readonly resume?: () => PromiseLike<void>;
  readonly delay?: boolean;
  readonly trigger?: string | symbol | ReadonlyArray<string | symbol>;
}
interface CoroutinePort<T, R, S> {
  readonly send: (msg: S | PromiseLike<S>) => AtomicPromise<IteratorResult<R, T>>;
  readonly recv: () => AtomicPromise<IteratorResult<R, undefined>>;
  readonly connect: <U>(com: () => Generator<S, U, T | R> | AsyncGenerator<S, U, T | R>) => Promise<U>;
}
type Reply<R, T> = (msg: IteratorResult<R, T> | PromiseLike<never>) => void;

export interface CoroutineInterface<T = unknown, R = unknown, _ = unknown> extends Promise<T>, AsyncIterable<R> {
  readonly constructor: {
    readonly port: symbol;
    readonly terminate: symbol;
    readonly [Symbol.species]: typeof Promise;
  };
}
export interface Coroutine<T = unknown, R = unknown, S = unknown> extends AtomicPromise<T>, AsyncIterable<R> {
  constructor: typeof Coroutine;
}
export class Coroutine<T = unknown, R = unknown, S = unknown> extends AtomicPromise<T> implements Promise<T>, AsyncIterable<R> {
  protected static readonly run: typeof run = run;
  public static readonly port: typeof port = port;
  public static readonly terminate: typeof terminate = terminate;
  public static get [Symbol.species]() {
    return AtomicPromise;
  }
  constructor(
    gen: (this: Coroutine<T, R, S>) => Generator<R, T, S> | AsyncGenerator<R, T, S>,
    opts: CoroutineOptions = {},
  ) {
    super(resolve => res = resolve);
    var res!: (v: T | AtomicPromise<T>) => void;
    this[status] = new Status(opts);
    void res(this[status].result);
    this[Coroutine.run] = async () => {
      let reply: Reply<R, T> = noop;
      try {
        this[Coroutine.run] = noop;
        if (!this[status].alive) return;
        const resume = (): AtomicPromise<S> =>
          this[status].msgs.length > 0
            ? AtomicPromise.resolve(([, reply] = this[status].msgs.shift()!)[0])
            : this[status].resume.then(resume);
        const iter = gen.call(this);
        let cnt = 0;
        while (this[status].alive) {
          void ++cnt;
          const [msg] = cnt === 1
            // Don't block.
            ? [undefined as S | undefined]
            // Block.
            : await AtomicPromise.all([
                // Don't block.
                this[status].settings.size === 0
                  ? AtomicPromise.resolve(undefined as S | undefined)
                  : resume(),
                // Don't block.
                AtomicPromise.all([
                  this[status].settings.resume(),
                  wait(this[status].settings.interval),
                ]),
              ]);
          assert(msg instanceof Promise === false);
          assert(msg instanceof AtomicPromise === false);
          if (!this[status].alive) break;
          // Block.
          // `value` can be Promise when using iterator.
          // `value` never be Promise when using async iterator.
          const { value, done } = await iter.next(msg!);
          if (!this[status].alive) break;
          if (!done) {
            const state = this[status].state;
            this[status].state = new AtomicFuture();
            // Block.
            await state.bind({ value: value as R, done });
            // Don't block.
            void reply({ value: value as R, done });
            reply = noop;
            continue;
          }
          else {
            this[status].alive = false;
            // Block.
            await this[status].state.bind({ value: undefined, done });
            // Don't block.
            void reply({ value: value as T, done });
            reply = noop;
            void this[status].result.bind(value as T);
            return;
          }
        }
        void reply(AtomicPromise.reject(new Error(`Spica: Coroutine: Canceled.`)));
      }
      catch (reason) {
        void reply(AtomicPromise.reject(reason));
        void this[Coroutine.terminate](reason);
      }
    };
    if (this[status].settings.trigger !== undefined) {
      for (const prop of new Set(Array<string | symbol>().concat(this[status].settings.trigger))) {
        const desc = Object.getOwnPropertyDescriptor(this, prop) || {
          value: this[prop],
          enumerable: true,
          configurable: true,
          writable: true,
        };
        void Object.defineProperty(this, prop, {
          set(value: unknown) {
            void Object.defineProperty(this, prop, { ...desc, value });
            void this[Coroutine.run]();
          },
          get() {
            void Object.defineProperty(this, prop, desc);
            void this[Coroutine.run]();
            return this[prop];
          },
          enumerable: true,
          configurable: true,
        });
      }
    }
    void tick(() => void this[Coroutine.run]());
  }
  private readonly [status]: Status<T, R, S>;
  protected [run]: () => void;
  public async *[Symbol.asyncIterator](): AsyncIterator<R, undefined, undefined> {
    !this[status].settings.delay && void this[run]();
    while (this[status].alive) {
      const { value } = await this[status].state;
      if (!this[status].alive) break;
      yield value!;
    }
    return;
  }
  public [terminate](reason?: unknown): void {
    if (!this[status].alive) return;
    void this[run]();
    this[status].alive = false;
    // Don't block.
    void this[status].state.bind({ value: undefined, done: true });
    void this[status].result.bind(AtomicPromise.reject(reason));
  }
  public readonly [port]: CoroutinePort<T, R, S> = {
    recv: () => {
      !this[status].settings.delay && void this[run]();
      return this[status].state;
    },
    send: (msg: S | PromiseLike<S>): AtomicPromise<IteratorResult<R, T>> => {
      if (!this[status].alive) return AtomicPromise.reject(new Error(`Spica: Coroutine: Canceled.`));
      !this[status].settings.delay && void this[run]();
      const res = new AtomicFuture<IteratorResult<R, T>>();
      // Don't block.
      void this[status].msgs.push([msg, res.bind]);
      void this[status].resume.bind();
      this[status].resume = new AtomicFuture();
      while (this[status].msgs.length > this[status].settings.size) {
        // Don't block.
        const [, reply] = this[status].msgs.shift()!;
        void reply(AtomicPromise.reject(new Error(`Spica: Coroutine: Overflowed.`)));
      }
      return res.then();
    },
    connect: async <U>(com: () => Generator<S, U, T | R> | AsyncGenerator<S, U, T | R>): Promise<U> => {
      !this[status].settings.delay && void this[run]();
      const iter = com();
      let reply: T | R | undefined;
      while (true) {
        const { value, done } = await iter.next(reply!);
        if (done) return value as U;
        reply = (await this[port].send(value as S)).value;
      }
    },
  };
}
Coroutine.prototype.then = function () {
  !this[status].settings.delay && void this[run]();
  return Coroutine.prototype['__proto__'].then.call(this, ...arguments);
};
Coroutine.prototype.catch = function () {
  !this[status].settings.delay && void this[run]();
  return Coroutine.prototype['__proto__'].catch.call(this, ...arguments);
};
Coroutine.prototype.finally = function () {
  !this[status].settings.delay && void this[run]();
  return Coroutine.prototype['__proto__'].finally.call(this, ...arguments);
};

class Status<T, R, S> {
  constructor(opts: CoroutineOptions) {
    void extend(this.settings, opts);
    void this.result.finally(() => {
      while (this.msgs.length > 0) {
        // Don't block.
        const [, reply] = this.msgs.shift()!;
        void reply(AtomicPromise.reject(new Error(`Spica: Coroutine: Canceled.`)));
      }
    });
  }
  public alive = true;
  public state = new AtomicFuture<IteratorResult<R, undefined>>();
  public resume = new AtomicFuture<never>();
  public readonly result = new AtomicFuture<T>();
  public readonly msgs: [S | PromiseLike<S>, Reply<R, T>][] = [];
  public readonly settings: DeepImmutable<DeepRequired<CoroutineOptions>> = {
    size: 0,
    interval: 0,
    resume: () => clock,
    delay: false,
    trigger: undefined as any,
  };
}
