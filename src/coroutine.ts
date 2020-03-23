import { Array, Error } from './global';
import { ObjectDefineProperty, ObjectGetOwnPropertyDescriptor } from './alias';
import { AtomicPromise } from './promise';
import { AtomicFuture } from './future';
import type { Structural, DeepImmutable, DeepRequired } from './type';
import { extend } from './assign';
import { wait, tick } from './clock';
import { causeAsyncException } from './exception';
import { noop } from './noop';

export interface CoroutineOptions {
  readonly autorun?: boolean;
  readonly size?: number;
  readonly interval?: number;
  readonly resume?: () => PromiseLike<void> | void;
  readonly trigger?: string | symbol | ReadonlyArray<string | symbol>;
}

export interface CoroutineInterface<T = unknown, R = T, _ = unknown> extends Promise<T>, AsyncIterable<awaited R> {
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
  public state = new AtomicFuture<IteratorResult<awaited R, undefined>>();
  public resume = new AtomicFuture<undefined>();
  public readonly result = new AtomicFuture<T>();
  public readonly msgs: [S, Reply<R, T>][] = [];
  public readonly settings: DeepImmutable<DeepRequired<CoroutineOptions>> = {
    autorun: true,
    size: 0,
    interval: 0,
    resume: () => void 0,
    trigger: void 0 as any,
  };
}
type Reply<R, T> = (msg: IteratorResult<awaited R, awaited T> | PromiseLike<never>) => void;

const internal = Symbol.for('spica/coroutine::internal');

export interface Coroutine<T = unknown, R = T, S = unknown> extends AtomicPromise<T>, AsyncIterable<awaited R> {
  constructor: typeof Coroutine;
}
export class Coroutine<T = unknown, R = T, S = unknown> extends AtomicPromise<T> implements Promise<T>, AsyncIterable<awaited R>, CoroutineInterface<T, R, S> {
  public static readonly alive: typeof alive = alive;
  protected static readonly init: typeof init = init;
  public static readonly exit: typeof exit = exit;
  public static readonly terminate: typeof terminate = terminate;
  public static readonly port: typeof port = port;
  public static get [Symbol.species]() {
    return AtomicPromise;
  }
  constructor(
    gen: (this: Coroutine<T, R, S>) => Generator<R, T | PromiseLike<T>, S> | AsyncGenerator<R, T, S>,
    opts: CoroutineOptions = {},
  ) {
    super(resolve => res = resolve);
    var res!: (v: T | AtomicPromise<T>) => void;
    this[internal] = new Internal(opts);
    this[port] = new Port(this, this[internal]);
    void res(this[internal].result);
    this[Coroutine.init] = async () => {
      let reply: Reply<R, T> = noop;
      try {
        this[Coroutine.init] = noop;
        if (!this[internal].alive) return;
        const resume = (): [S] | PromiseLike<[S]> =>
          this[internal].msgs.length > 0
            ? [([, reply] = this[internal].msgs.shift()!)[0]]
            : this[internal].resume.then(resume);
        const iter = gen.call(this);
        let cnt = 0;
        while (this[internal].alive) {
          void ++cnt;
          const [[msg]] = cnt === 1
            // Don't block.
            ? [[void 0]]
            // Block.
            : await AtomicPromise.all([
                // Don't block.
                this[internal].settings.size === 0
                  ? [void 0]
                  : resume(),
                // Don't block.
                AtomicPromise.all([
                  this[internal].settings.resume(),
                  this[internal].settings.interval > 0
                    ? wait(this[internal].settings.interval)
                    : void 0,
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
            // Block.
            const result = await value as awaited R;
            // Don't block.
            void this[internal].state.bind({ value: result, done });
            void reply({ value: result, done });
            this[internal].state = new AtomicFuture();
            continue;
          }
          else {
            // Block.
            const result = await value as awaited T;
            if (!this[internal].alive) break;
            this[internal].alive = false;
            // Don't block.
            void this[internal].state.bind({ value: void 0, done });
            void this[internal].result.bind(result);
            void reply({ value: result, done });
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
    if (this[internal].settings.trigger !== void 0) {
      for (const prop of Array<string | symbol>().concat(this[internal].settings.trigger)) {
        if (prop in this) continue;
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
    this[internal].settings.autorun && void tick(() => void this[Coroutine.init]());
  }
  public readonly [internal]: Internal<T, R, S>;
  public get [alive](): boolean {
    return this[internal].alive;
  }
  public [init]: () => void;
  public [exit](result: T | PromiseLike<T>): void {
    if (!this[internal].alive) return;
    void AtomicPromise.resolve(result)
      .then(
        result => {
          if (!this[internal].alive) return;
          this[internal].alive = false;
          // Don't block.
          void this[internal].state.bind({ value: void 0, done: true });
          void this[internal].result.bind(result);
        },
        reason => {
          if (!this[internal].alive) return;
          this[internal].alive = false;
          // Don't block.
          void this[internal].state.bind({ value: void 0, done: true });
          void this[internal].result.bind(AtomicPromise.reject(reason));
        });
  }
  public [terminate](reason?: unknown): void {
    return this[exit](AtomicPromise.reject(reason));
  }
  public async *[Symbol.asyncIterator](): AsyncIterator<awaited R, undefined, undefined> {
    while (this[internal].alive) {
      const { value } = await this[internal].state;
      if (!this[internal].alive) break;
      yield value!;
    }
    return this.then(() => void 0);
  }
  public readonly [port]: Structural<Port<T, R, S>>;
}

class Port<T, R, S> {
  constructor(
    private co: Coroutine<T, R, S>,
    private internal: Internal<T, R, S>,
  ) {
  }
  public recv(): AtomicPromise<IteratorResult<awaited R, awaited T>> {
    return this.internal.state
      .then(({ value, done }) =>
        done
          ? this.co.then(value => ({ value, done }))
          : { value: value!, done });
  }
  public send(msg: S): AtomicPromise<IteratorResult<awaited R, awaited T>> {
    if (!this.internal.alive) return AtomicPromise.reject(new Error(`Spica: Coroutine: Canceled.`));
    const res = new AtomicFuture<IteratorResult<awaited R, awaited T>>();
    // Don't block.
    void this.internal.msgs.push([msg, res.bind]);
    void this.internal.resume.bind();
    this.internal.resume = new AtomicFuture();
    while (this.internal.msgs.length > this.internal.settings.size) {
      // Don't block.
      const [, reply] = this.internal.msgs.shift()!;
      void reply(AtomicPromise.reject(new Error(`Spica: Coroutine: Overflowed.`)));
    }
    return res.then();
  }
  public async connect<U>(com: (this: Coroutine<T, R, S>) => Generator<S, U, awaited T | awaited R> | AsyncGenerator<S, U, awaited T | awaited R>): Promise<awaited U> {
    const iter = com.call(this.co);
    let reply: awaited T | awaited R | undefined;
    while (true) {
      const { value, done } = await iter.next(reply!);
      if (done) return value as U;
      reply = (await this.send(value as S)).value;
    }
  }
}

export function isCoroutine(target: unknown): target is CoroutineInterface<unknown, unknown, unknown> {
  return typeof target === 'object'
      && target !== null
      && typeof target.constructor['exit'] === 'symbol'
      && typeof target[target.constructor['exit']] === 'function'
      && typeof target.constructor['terminate'] === 'symbol'
      && typeof target[target.constructor['terminate']] === 'function'
      && typeof target.constructor['port'] === 'symbol'
      && typeof target[target.constructor['port']] === 'object';
}
