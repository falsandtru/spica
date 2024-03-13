import { isArray } from './alias';
import { Coroutine, CoroutineOptions } from './coroutine';
import { AtomicPromise, never } from './promise';

export class Copropagator<T = unknown, R = T, S = unknown> extends Coroutine<T, R, S> {
  constructor(
    coroutines: Iterable<Coroutine<T, unknown, unknown>>,
    reducer: (results: T[]) => T = results => results[0],
    opts?: CoroutineOptions,
  ) {
    const cs = isArray(coroutines)
      ? coroutines
      : [...coroutines];
    super(async function* () {
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
      AtomicPromise.all(cs).then(
        results =>
          results.length === 0
            ? void this[Coroutine.terminate](new Error(`Spica: Copropagator: No result`))
            : void this[Coroutine.exit](reducer(results)),
        reason =>
          void this[Coroutine.terminate](reason));
      return never;
    }, { delay: false, ...opts });
  }
}
