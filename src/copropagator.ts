import { Map, Error } from './global';
import { isArray } from './alias';
import { Coroutine, CoroutineOptions } from './coroutine';
import { AtomicPromise, never } from './promise';

// Must support living iterables.

export class Copropagator<T = unknown, R = T, S = unknown> extends Coroutine<T, R, S> {
  constructor(
    coroutines: Iterable<Coroutine<T, R, unknown>>,
    reducer: (results: T[]) => T = results => results[0],
    opts?: CoroutineOptions,
  ) {
    assert(new Set(coroutines).size === [...coroutines].length);
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
      void all(coroutines).then(
        results =>
          results.length === 0
            ? void this[Coroutine.terminate](new Error(`Spica: Copropagator: No result.`))
            : void this[Coroutine.exit](reducer(results)),
        reason =>
          void this[Coroutine.terminate](reason));
      return never;
    }, { delay: false, ...opts });
  }
}

function all<T>(sources: Iterable<PromiseLike<T>>, memory?: Map<PromiseLike<T>, T>): AtomicPromise<T[]> {
  const before = isArray(sources)
    ? sources
    : [...sources];
  return AtomicPromise.all(before).then(values => {
    const after = isArray(sources)
      ? sources
      : [...sources];
    const same = after.length === before.length && after.every((_, i) => after[i] === before[i]);
    if (!memory && same) return values;
    memory ??= new Map();
    for (let i = 0; i < values.length; ++i) {
      void memory.set(before[i], values[i]);
    }
    return same
      ? [...memory.values()]
      : all(after, memory);
  });
}
