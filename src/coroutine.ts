import { Future } from './future'; 
import { DeepRequired } from './type';
import { extend } from './assign';
import { tuple } from './tuple';
import { noop } from './noop';

const clock = Promise.resolve();
const port = Symbol();
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
  static readonly port: typeof port = port;
  static readonly terminator: typeof terminator = terminator;
  static get [Symbol.species]() {
    return Promise;
  }
  constructor(
    gen: (this: Coroutine<T, R>) => Iterator<T | R> | AsyncIterator<T | R>,
    opts: CoroutineOptions = {},
  ) {
    super((resolve, reject) => {
      result = new Future<T>();
      void result.then(resolve, reject);
    });
    var result!: Future<T>;
    this.result = result;
    void Object.freeze(extend(this.settings, opts));
    void (async () => {
      try {
        const resume = async (): Promise<[S, Reply<R>]> =>
          this.msgs.length > 0
            ? Promise.all(this.msgs.shift()!)
            : this.resume.then(resume);
        const iter = gen.call(this) as ReturnType<typeof gen>;
        let cnt = 0;
        while (this.alive) {
          void ++cnt;
          // Block.
          const [[msg, reply]] = await Promise.all([
            // Don't block.
            cnt === 1 || this.settings.size === 0
              ? Promise.resolve(tuple([undefined as S | undefined, noop as Reply<R>]))
              : resume(),
            // Don't block.
            cnt === 1
              ? undefined
              : this.settings.resume(),
          ]);
          assert(msg instanceof Promise === false);
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
            await this.state.bind({ value: undefined as any as R, done });
            // Don't block.
            void reply({ value: undefined as any as R, done });
            void result.bind(value as T);
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
    })();
  }
  private alive = true;
  private state = new Future<IteratorResult<R>>();
  private resume = new Future();
  private readonly result: Future<T>;
  private readonly msgs: [S | PromiseLike<S>, Reply<R>][] = [];
  private readonly settings: DeepRequired<CoroutineOptions> = {
    resume: () => clock,
    size: 0,
  };
  public [terminator] = (reason?: any): void => {
    if (!this.alive) return;
    this.alive = false;
    // Don't block.
    void this.state.bind({ value: undefined as any as R, done: true });
    void this.result.bind(Promise.reject(reason));
    while (this.msgs.length > this.settings.size) {
      // Don't block.
      const [, reply] = this.msgs.shift()!;
      void reply(Promise.reject(new Error(`Spica: Coroutine: Canceled.`)));
    }
  }
  public readonly [Symbol.asyncIterator] = async function* (this: Coroutine<T, R, S>): AsyncIterableIterator<R> {
    while (this.alive) {
      const { value, done } = await this.state;
      if (done) return;
      assert(value instanceof Promise === false);
      yield value;
    }
  }
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
}
