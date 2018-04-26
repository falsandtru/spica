import { Future } from './future'; 
import { If, TEq } from './type';
import { tick } from './tick'; 

type Result<T, S> = If<TEq<Exclude<T, S>, never>, T, Exclude<T, S>>;

const clock = Promise.resolve();

export class Coroutine<T, S = void> extends Promise<Result<T, S>> {
  static get [Symbol.species]() {
    return Promise;
  }
  constructor(
    gen: (this: Coroutine<T, S>) => Iterator<T | S> | AsyncIterator<T | S>,
    resume: () => Promise<void> = () => clock,
  ) {
    super((resolve, reject) =>
      void tick(() => void this.result.then(resolve, reject)));
    const iter = gen.call(this);
    void (async () => {
      try {
        while (this.alive) {
          const { value, done } = await iter.next();
          if (!this.alive) break;
          if (!done) {
            await value;
            await this.state.bind({ value: value as any as S, done });
            this.clock = resume();
            await this.clock;
            this.state = new Future();
            continue;
          }
          else {
            this.alive = false;
            await this.state.bind({ value: undefined as any as S, done });
            this.result.bind(value as Result<T, S>);
          }
        }
      }
      catch (e) {
        void this.terminate(e);
      }
    })();
  }
  private alive = true;
  private clock!: Promise<void>;
  private state = new Future<IteratorResult<S>>();
  private readonly result = new Future<Result<T, S>>();
  public terminate(reason?: any): void {
    if (!this.alive) return;
    this.alive = false;
    void (async () => {
      await this.state.bind({ value: undefined as any as S, done: true });
      this.result.bind(Promise.reject(reason));
    })();
  }
  public [Symbol.asyncIterator] = async function* (this: Coroutine<T, S>): AsyncIterableIterator<S> {
    await this.clock; // Skip the current state if it's already resolved.
    while (this.alive) {
      const { value, done } = await this.state;
      if (done) break;
      yield value;
    }
  }
}
