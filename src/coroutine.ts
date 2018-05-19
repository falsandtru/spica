import { Future } from './future'; 
import { Cancellation } from './cancellation';
import { Either, Left, Right } from './either';
import { DeepRequired } from './type';
import { extend } from './assign';
import { tuple } from './tuple';
import { tick } from './tick';
import { noop } from './noop';

const clock = Promise.resolve();
const run = Symbol();
const port = Symbol();
const destructor = Symbol();
const terminator = Symbol();

export interface CoroutineOptions {
  readonly resume?: () => Promise<void>;
  readonly size?: number;
}
export interface CoroutinePort<R, S> {
  readonly send: (msg: S | PromiseLike<S>) => Promise<IteratorResult<R>>;
  readonly recv: () => Promise<IteratorResult<R>>;
}
type Reply<R> = (msg: IteratorResult<R> | Promise<never>) => void;

export class Coroutine<T, R = void, S = void> extends Promise<T> implements AsyncIterable<R> {
  protected static readonly run: typeof run = run;
  public static readonly port: typeof port = port;
  protected static readonly destructor: typeof destructor = destructor;
  public static readonly terminator: typeof terminator = terminator;
  public static get [Symbol.species]() {
    return Promise;
  }
  constructor(
    gen: (this: Coroutine<T, R>) => Iterator<T | R> | AsyncIterator<T | R>,
    opts: CoroutineOptions = {},
    autorun: boolean = true,
  ) {
    super(resolve => res = resolve);
    var res!: (v: T | Promise<never>) => void;
    void this.result.register(m => void res(m.extract(reason => Promise.reject(reason))));
    void this.result.register(() => void this[Coroutine.destructor]());
    void Object.freeze(extend(this.settings, opts));
    this[Coroutine.run] = async () => {
      try {
        this[Coroutine.run] = noop;
        const resume = async (): Promise<[S, Reply<R>]> =>
          this.msgs.length > 0
            ? Promise.all(this.msgs.shift()!)
            : this.resume.then(resume);
        const iter = gen.call(this) as ReturnType<typeof gen>;
        let cnt = 0;
        while (this.alive) {
          void ++cnt;
          // Block.
          const [[msg, reply]] = cnt === 1
            ? [[undefined as S | undefined, noop as Reply<R>]]
            : await Promise.all([
                // Don't block.
                this.settings.size === 0
                  ? Promise.resolve(tuple([undefined as S | undefined, noop as Reply<R>]))
                  : resume(),
                // Don't block.
                this.settings.resume(),
              ]);
          assert(msg instanceof Promise === false);
          // Block.
          const { value: val, done } = await iter.next(msg);
          const value = await val; // Workaround for the TypeScript's bug.
          assert(value instanceof Promise === false);
          if (!this.alive) return;
          if (!done) {
            // Don't block.
            const state = this.state.bind({ value: value as R, done });
            assert(state === this.state);
            this.state = new Future();
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
            void this.result.cancel(Right(value as T));
            while (this.msgs.length > 0) {
              // Don't block.
              const [, reply] = this.msgs.shift()!;
              void reply(Promise.reject(new Error(`Spica: Coroutine: Canceled.`)));
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
  private state = new Future<IteratorResult<R>>();
  private resume = new Future();
  private readonly result: Cancellation<Either<any, T>> = new Cancellation();
  private readonly msgs: [S | PromiseLike<S>, Reply<R>][] = [];
  private readonly settings: DeepRequired<CoroutineOptions> = {
    resume: () => clock,
    size: 0,
  };
  public readonly [Symbol.asyncIterator] = async function* (this: Coroutine<T, R, S>): AsyncIterableIterator<R> {
    while (this.alive) {
      const { value, done } = await this.state;
      assert(value instanceof Promise === false);
      if (done || this.result.canceled) return;
      yield value;
    }
  };
  public readonly [port]: CoroutinePort<R, S> = {
    recv: () => this.state,
    send: (msg: S | PromiseLike<S>): Promise<IteratorResult<R>> => {
      if (!this.alive) return Promise.reject(new Error(`Spica: Coroutine: Canceled.`));
      const res = new Future<IteratorResult<R>>();
      // Don't block.
      void this.msgs.push([msg, res.bind]);
      void this.resume.bind(undefined);
      this.resume = new Future();
      while (this.msgs.length > this.settings.size) {
        // Don't block.
        const [, reply] = this.msgs.shift()!;
        void reply(Promise.reject(new Error(`Spica: Coroutine: Overflowed.`)));
      }
      return res.then();
    },
  };
  public [terminator] = (reason?: any): void => {
    if (!this.alive) return;
    this.alive = false;
    // Don't block.
    void this.state.bind({ value: undefined as any as R, done: true });
    void this.result.cancel(Left(reason));
    while (this.msgs.length > 0) {
      // Don't block.
      const [, reply] = this.msgs.shift()!;
      void reply(Promise.reject(new Error(`Spica: Coroutine: Canceled.`)));
    }
  };
  protected [destructor]: () => void = noop;
}
