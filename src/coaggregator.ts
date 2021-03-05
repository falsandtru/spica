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
      // FIXME: Remove the next type assertion after #28801 is fixed.
      for await (const [i, result] of select({ ...coroutines } as unknown as Record<string, Coroutine<T, R, S>>)) {
        assert(Number.isSafeInteger(+i));
        if (result.done) {
          results[i] = result.value;
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
