import { AtomicPromise } from './promise';
import { AtomicFuture } from './future'; 
import { Cancellation } from './cancellation';
import { DeepImmutable, DeepRequired } from './type';
import { extend } from './assign';
import { tuple } from './tuple';
import { clock, wait, tick } from './clock';
import { noop } from './noop';

const status = Symbol();
const run = Symbol();
const port = Symbol();
const terminator = Symbol();

export interface CoroutineOptions {
  readonly size?: number;
  readonly interval?: number,
  readonly resume?: () => PromiseLike<void>;
  readonly autorun?: boolean;
}
interface CoroutinePort<T, R, S> {
  //readonly send: (msg: S | PromiseLike<S>) => AtomicPromise<IteratorResult<R, T>>;
  readonly send: (msg: S | PromiseLike<S>) => AtomicPromise<IteratorResult<R>>;
  //readonly recv: () => AtomicPromise<IteratorResult<R, T>>;
  readonly recv: () => AtomicPromise<IteratorResult<R>>;
  //readonly connect: <U>(com: () => Iterator<S, U> | AsyncIterator<S, U>) => Promise<U>;
  readonly connect: <U = T | R>(com: () => Iterator<S> | AsyncIterator<S>) => Promise<U>;
}
type Reply<R> = (msg: IteratorResult<R> | Promise<never>) => void;

export interface CoroutineInterface<T, R = void, _ = void> extends Promise<T>, AsyncIterable<R> {
  readonly constructor: {
    readonly port: symbol;
    readonly terminator: symbol;
    readonly [Symbol.species]: typeof Promise;
  };
}
export interface Coroutine<T, R = void, S = void> extends AtomicPromise<T>, AsyncIterable<R> {
  constructor: typeof Coroutine;
}
export class Coroutine<T, R = void, S = void> extends AtomicPromise<T> implements Promise<T>, AsyncIterable<R> {
  protected static readonly run: typeof run = run;
  public static readonly port: typeof port = port;
  public static readonly terminator: typeof terminator = terminator;
  public static get [Symbol.species]() {
    return AtomicPromise;
  }
  constructor(
    gen: (this: Coroutine<T, R, S>) => Iterator<T | R> | AsyncIterator<T | R>,
    opts: CoroutineOptions = {},
  ) {
    super(resolve => res = resolve);
    var res!: (v: T | AtomicPromise<never>) => void;
    this[status] = new Status(opts);
    void this[status].result.register(res);
    this[Coroutine.run] = async () => {
      try {
        this[Coroutine.run] = noop;
        const resume = (): AtomicPromise<[S, Reply<R>]> =>
          this[status].msgs.length > 0
            ? AtomicPromise.all(this[status].msgs.shift()!)
            : this[status].resume.then(resume);
        const iter = gen.call(this) as ReturnType<typeof gen>;
        let cnt = 0;
        while (this[status].alive) {
          void ++cnt;
          const [[msg, reply]] = cnt === 1
            // Don't block.
            ? [[undefined as S | undefined, noop as Reply<R>]]
            // Block.
            : await AtomicPromise.all([
                // Don't block.
                this[status].settings.size === 0
                  ? AtomicPromise.resolve(tuple([undefined as S | undefined, noop as Reply<R>]))
                  : resume(),
                // Don't block.
                AtomicPromise.all([
                  this[status].settings.resume(),
                  wait(this[status].settings.interval),
                ]),
              ]);
          assert(msg instanceof Promise === false);
          assert(msg instanceof AtomicPromise === false);
          // Block.
          const { value, done } = await iter.next(msg);
          //assert(value instanceof Promise === false);
          //assert(value instanceof AtomicPromise === false);
          if (!this[status].alive) return;
          if (!done) {
            const state = this[status].state;
            this[status].state = new AtomicFuture();
            // Block.
            await state.bind({ value: value as R, done });
            // Don't block.
            void reply({ value: value as R, done });
            continue;
          }
          else {
            this[status].alive = false;
            // Block.
            await this[status].state.bind({ value: value as any as R, done });
            // Don't block.
            void reply({ value: value as any as R, done });
            void this[status].result.cancel(value as T);
            while (this[status].msgs.length > 0) {
              // Don't block.
              const [, reply] = this[status].msgs.shift()!;
              void reply(AtomicPromise.reject(new Error(`Spica: Coroutine: Canceled.`)));
            }
          }
        }
      }
      catch (reason) {
        void this[Coroutine.terminator](reason);
      }
    };
    this[status].settings.autorun
      ? void this[Coroutine.run]()
      : void tick(() => void this[Coroutine.run]());
  }
  private readonly [status]: Status<T, R, S>;
  protected [run]: () => void;
  public async *[Symbol.asyncIterator](): AsyncIterableIterator<R> {
    while (this[status].alive) {
      const { value, done } = await this[status].state;
      //assert(value instanceof Promise === false);
      //assert(value instanceof AtomicPromise === false);
      if (done || this[status].result.canceled) return;
      yield value;
    }
  }
  public readonly [port]: CoroutinePort<T, R, S> = {
    recv: () => this[status].state,
    send: (msg: S | PromiseLike<S>): AtomicPromise<IteratorResult<R>> => {
      if (!this[status].alive) return AtomicPromise.reject(new Error(`Spica: Coroutine: Canceled.`));
      const res = new AtomicFuture<IteratorResult<R>>();
      // Don't block.
      void this[status].msgs.push([msg, res.bind]);
      void this[status].resume.bind(undefined);
      this[status].resume = new AtomicFuture();
      while (this[status].msgs.length > this[status].settings.size) {
        // Don't block.
        const [, reply] = this[status].msgs.shift()!;
        void reply(AtomicPromise.reject(new Error(`Spica: Coroutine: Overflowed.`)));
      }
      return res.then();
    },
    connect: async <U = T | R>(com: () => Iterator<S> | AsyncIterator<S>): Promise<U> => {
      const iter = com();
      let reply: T | R | undefined;
      while (true) {
        const msg = await iter.next(reply!);
        if (msg.done) return msg.value as any as U;
        const rpy = await this[port].send(msg.value);
        reply = rpy.value;
      }
    },
  };
  public readonly [terminator]: (reason?: any) => void = reason => {
    if (!this[status].alive) return;
    this[status].alive = false;
    // Don't block.
    void this[status].state.bind({ value: undefined as any as R, done: true });
    void this[status].result.cancel(AtomicPromise.reject(reason));
    while (this[status].msgs.length > 0) {
      // Don't block.
      const [, reply] = this[status].msgs.shift()!;
      void reply(AtomicPromise.reject(new Error(`Spica: Coroutine: Canceled.`)));
    }
  };
}

class Status<T, R, S> {
  constructor(opts: CoroutineOptions) {
    void extend(this.settings, opts);
  }
  public alive = true;
  public state = new AtomicFuture<IteratorResult<R>>();
  public resume = new AtomicFuture();
  public readonly result: Cancellation<T | AtomicPromise<never>> = new Cancellation();
  public readonly msgs: [S | PromiseLike<S>, Reply<R>][] = [];
  public readonly settings: DeepImmutable<DeepRequired<CoroutineOptions>> = {
    size: 0,
    interval: 0,
    resume: () => clock,
    autorun: true,
  };
}
