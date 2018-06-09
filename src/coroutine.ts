import { AtomicPromise } from './promise';
import { AtomicFuture } from './future'; 
import { Cancellation } from './cancellation';
import { DeepRequired } from './type';
import { extend } from './assign';
import { tuple } from './tuple';
import { clock, tick } from './clock';
import { noop } from './noop';

const run = Symbol();
const port = Symbol();
const destructor = Symbol();
const terminator = Symbol();

export interface CoroutineOptions {
  readonly resume?: () => PromiseLike<void>;
  readonly size?: number;
}
export interface CoroutinePort<R, S> {
  readonly send: (msg: S | PromiseLike<S>) => AtomicPromise<IteratorResult<R>>;
  readonly recv: () => AtomicPromise<IteratorResult<R>>;
}
type Reply<R> = (msg: IteratorResult<R> | Promise<never>) => void;

export class Coroutine<T, R = void, S = void> extends AtomicPromise<T> implements AsyncIterable<R> {
  protected static readonly run: typeof run = run;
  public static readonly port: typeof port = port;
  protected static readonly destructor: typeof destructor = destructor;
  public static readonly terminator: typeof terminator = terminator;
  public static get [Symbol.species]() {
    return AtomicPromise;
  }
  constructor(
    gen: (this: Coroutine<T, R>) => Iterator<T | R> | AsyncIterator<T | R>,
    opts: CoroutineOptions = {},
    autorun: boolean = true,
  ) {
    super(resolve => res = resolve);
    var res!: (v: T | AtomicPromise<never>) => void;
    void this.result.register(res);
    void this.result.register(() => void this[Coroutine.destructor]());
    void Object.freeze(extend(this.settings, opts));
    this[Coroutine.run] = async () => {
      try {
        this[Coroutine.run] = noop;
        const resume = (): AtomicPromise<[S, Reply<R>]> =>
          this.msgs.length > 0
            ? AtomicPromise.all(this.msgs.shift()!)
            : this.resume.then(resume);
        const iter = gen.call(this) as ReturnType<typeof gen>;
        let cnt = 0;
        while (this.alive) {
          void ++cnt;
          // Block.
          const [[msg, reply]] = cnt === 1
            ? [[undefined as S | undefined, noop as Reply<R>]]
            : await AtomicPromise.all([
                // Don't block.
                this.settings.size === 0
                  ? AtomicPromise.resolve(tuple([undefined as S | undefined, noop as Reply<R>]))
                  : resume(),
                // Don't block.
                this.settings.resume(),
              ]);
          assert(msg instanceof Promise === false);
          assert(msg instanceof AtomicPromise === false);
          // Block.
          const { value, done } = await iter.next(msg);
          assert(value instanceof Promise === false);
          assert(value instanceof AtomicPromise === false);
          if (!this.alive) return;
          if (!done) {
            // Don't block.
            const state = this.state.bind({ value: value as R, done });
            assert(state === this.state);
            this.state = new AtomicFuture();
            // Block.
            await state;
            // Don't block.
            void reply({ value: value as R, done });
            continue;
          }
          else {
            this.alive = false;
            // Block.
            void this.state.bind({ value: undefined as any as R, done });
            void reply({ value: undefined as any as R, done });
            void this.result.cancel(value as T);
            while (this.msgs.length > 0) {
              // Don't block.
              const [, reply] = this.msgs.shift()!;
              void reply(AtomicPromise.reject(new Error(`Spica: Coroutine: Canceled.`)));
            }
          }
        }
      }
      catch (reason) {
        void this[Coroutine.terminator](reason);
      }
    };
    autorun
      ? void this[Coroutine.run]()
      : void tick(() => void this[Coroutine.run]());
  }
  protected [run]: () => void;
  private alive = true;
  private state = new AtomicFuture<IteratorResult<R>>();
  private resume = new AtomicFuture();
  private readonly result: Cancellation<T | AtomicPromise<never>> = new Cancellation();
  private readonly msgs: [S | PromiseLike<S>, Reply<R>][] = [];
  private readonly settings: DeepRequired<CoroutineOptions> = {
    resume: () => clock,
    size: 0,
  };
  public readonly [Symbol.asyncIterator] = async function* (this: Coroutine<T, R, S>): AsyncIterableIterator<R> {
    while (this.alive) {
      const { value, done } = await this.state;
      assert(value instanceof Promise === false);
      assert(value instanceof AtomicPromise === false);
      if (done || this.result.canceled) return;
      yield value;
    }
  };
  public readonly [port]: CoroutinePort<R, S> = {
    recv: () => this.state,
    send: (msg: S | PromiseLike<S>): AtomicPromise<IteratorResult<R>> => {
      if (!this.alive) return AtomicPromise.reject(new Error(`Spica: Coroutine: Canceled.`));
      const res = new AtomicFuture<IteratorResult<R>>();
      // Don't block.
      void this.msgs.push([msg, res.bind]);
      void this.resume.bind(undefined);
      this.resume = new AtomicFuture();
      while (this.msgs.length > this.settings.size) {
        // Don't block.
        const [, reply] = this.msgs.shift()!;
        void reply(AtomicPromise.reject(new Error(`Spica: Coroutine: Overflowed.`)));
      }
      return res.then();
    },
  };
  public [terminator] = (reason?: any): void => {
    if (!this.alive) return;
    this.alive = false;
    // Don't block.
    void this.state.bind({ value: undefined as any as R, done: true });
    void this.result.cancel(AtomicPromise.reject(reason));
    while (this.msgs.length > 0) {
      // Don't block.
      const [, reply] = this.msgs.shift()!;
      void reply(AtomicPromise.reject(new Error(`Spica: Coroutine: Canceled.`)));
    }
  };
  protected [destructor]: () => void = noop;
}
