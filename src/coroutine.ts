import { Future } from './future'; 

const terminator = Symbol();
const clock = Promise.resolve();

export class Coroutine<T, S = void> extends Promise<T> implements AsyncIterable<S> {
  static readonly terminator = terminator;
  static get [Symbol.species]() {
    return Promise;
  }
  constructor(
    gen: (this: Coroutine<T, S>) => Iterator<T | S> | AsyncIterator<T | S>,
    resume?: () => Promise<void>);
  constructor(
    gen: (this: Coroutine<T, S>) => Iterator<T | S> | AsyncIterator<T | S>,
    resume: () => Promise<void> = () => clock,
    private readonly result = new Future<T>()
  ) {
    super((resolve, reject) =>
      void result.then(resolve, reject));
    void (async () => {
      try {
        const iter = gen.call(this) as ReturnType<typeof gen>;
        while (this.alive) {
          const { value, done } = await iter.next();
          if (!this.alive) return;
          if (!done) {
            const state = this.state.bind({ value: await value as S, done });
            assert(state === this.state);
            if (!this.alive) return;
            this.state = new Future();
            await state;
            if (!this.alive) return;
            await (this.clock = resume());
            continue;
          }
          else {
            this.alive = false;
            await this.state.bind({ value: undefined as any as S, done });
            void result.bind(value as T);
          }
        }
      }
      catch (reason) {
        void this[Coroutine.terminator](reason);
      }
    })();
  }
  private alive = true;
  private clock = clock;
  private state = new Future<IteratorResult<S>>();
  public readonly [Symbol.asyncIterator] = async function* (this: Coroutine<T, S>): AsyncIterableIterator<S> {
    await this.clock; // Skip the current state if it's already resolved.
    while (this.alive) {
      const { value, done } = await this.state;
      if (done) return;
      yield value;
    }
  }
  public readonly [terminator] = (reason?: any): void => {
    if (!this.alive) return;
    this.alive = false;
    void this.state.bind({ value: undefined as any as S, done: true })
      .then(() => void this.result.bind(Promise.reject(reason)));
  }
}
