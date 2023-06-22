import { isArray } from './alias';
import { Coroutine, CoroutineOptions } from './coroutine';
import { AtomicPromise, never } from './promise';
import { select } from './select';

export class Coaggregator<T = unknown, R = T, S = unknown> extends Coroutine<T, R, S> {
  constructor(
    coroutines: Iterable<Coroutine<T, R, S>>,
    reducer: (results: T[]) => T = results => results[0],
    opts?: CoroutineOptions,
  ) {
    super(async function* () {
      const cs = isArray(coroutines)
        ? coroutines
        : [...coroutines];
      this.then(
        result => {
          for (const co of cs) {
            co[Coroutine.exit](result);
          }
        },
        reason => {
          const rejection = AtomicPromise.reject(reason);
          for (const co of cs) {
            co[Coroutine.exit](rejection);
          }
        });
      const results: T[] = [];
      for await (const { name, result } of select(cs)) {
        assert(Number.isSafeInteger(+name));
        if (result.done) {
          results[name] = result.value;
        }
        else {
          yield result.value;
        }
      }
      assert(Object.keys(results).length === results.length);
      assert(results.length === cs.length);
      results.length === 0
        ? this[Coroutine.terminate](new Error(`Spica: Coaggregator: No result.`))
        : this[Coroutine.exit](reducer(results));
      return never;
    }, { delay: false, ...opts });
  }
}
