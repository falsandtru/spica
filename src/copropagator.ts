import { Coroutine } from './coroutine';
import { AtomicPromise } from './promise';
import { never } from './clock';
import { Error } from './global';

export class Copropagator<T, R = T, S = unknown> extends Coroutine<T, R, S> {
  constructor(
    coroutines: Iterable<Coroutine<T, R, S>>,
    reducer: (results: T[]) => T = results => results[0],
  ) {
    super(async function* (): AsyncGenerator<R, T, S> {
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
      void AtomicPromise.all(coroutines).then(
        results =>
          results.length === 0
            ? void this[Coroutine.terminate](new Error(`Spica: Copropagator: No result.`))
            : void this[Coroutine.exit](reducer(results)),
        reason =>
          void this[Coroutine.terminate](reason));
      return never;
    }, { autorun: false });
    void this[Coroutine.init]();
  }
}
