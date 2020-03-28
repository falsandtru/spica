import { Error } from './global';
import { Coroutine } from './coroutine';
import { AtomicPromise } from './promise';
import { never } from './clock';
import { select } from './channel';

export class Coaggregator<T = unknown, R = T, S = unknown> extends Coroutine<T, R, S> {
  constructor(
    coroutines: readonly Coroutine<T, R, S>[],
    reducer: (results: T[]) => T = results => results[0],
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
      const results: T[] = [];
      for await (const [i, result] of select({ ...coroutines } as unknown as Record<string, Coroutine<T, R, S>>)) {
        if (result.done) {
          results[i] = result.value;
        }
        else {
          yield result.value;
        }
      }
      assert(results.length === coroutines.length);
      results.length === 0
        ? void this[Coroutine.terminate](new Error(`Spica: Coaggregator: No result.`))
        : void this[Coroutine.exit](reducer(results));
      return never;
    }, { autorun: false });
    void this[Coroutine.init]();
  }
}
