import { Array, Error } from './global';
import { Coroutine, CoroutineOptions } from './coroutine';
import { AtomicPromise, never } from './promise';
import { select } from './select';

export class Coaggregator<T = unknown, R = T, S = unknown> extends Coroutine<T, R, S> {
  constructor(
    coroutines: readonly Coroutine<T, R, S>[],
    reducer: (results: T[]) => T = results => results[0],
    opts?: CoroutineOptions,
  ) {
    super(async function* () {
      void this.then(
        result => {
          for (const co of coroutines) {
            void co[Coroutine.exit](result);
          }
        },
        reason => {
          const rejection = AtomicPromise.reject(reason);
          for (const co of coroutines) {
            void co[Coroutine.exit](rejection);
          }
        });
      const results: T[] = Array(coroutines.length);
      for await (const { name, result } of select(coroutines)) {
        assert(Number.isSafeInteger(+name));
        if (result.done) {
          results[name] = result.value;
        }
        else {
          yield result.value;
        }
      }
      assert(Object.keys(results).length === results.length);
      assert(results.length === coroutines.length);
      results.length === 0
        ? void this[Coroutine.terminate](new Error(`Spica: Coaggregator: No result.`))
        : void this[Coroutine.exit](reducer(results));
      return never;
    }, { delay: false, ...opts });
  }
}
