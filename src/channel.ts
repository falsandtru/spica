import { Map } from './global';
import { ObjectEntries } from './alias';
import { AtomicPromise } from './promise';

interface AsyncIterable<T = unknown, U = any> {
  [Symbol.asyncIterator](): AsyncIterator<T, U>;
}

type Result<T extends Record<string, AsyncIterable>> =
  { [P in keyof T]: readonly [P, AsyncGeneratorResult<T[P]>]; }[keyof T];
type AsyncGeneratorResult<G extends AsyncIterable> =
  G extends AsyncIterable<infer T, infer U> ? IteratorResult<T, U> :
  never;

export async function* select<T extends Record<string, AsyncIterable<unknown, unknown>>>(channels: T): AsyncGenerator<Result<T>, undefined, undefined> {
  const gs: Record<string, AsyncGenerator<unknown, unknown, undefined>> = ObjectEntries(channels)
    .reduce((o, [k, v]) => (o[k] = v[Symbol.asyncIterator](), o), {});
  const cs = new Map(ObjectEntries(gs).map(([k, v]) => [k, v.next().then(r => [k, r] as const)]));
  while (cs.size > 0) {
    yield AtomicPromise.race([...cs.values()]).then(
      ([k, r]) => {
        cs.delete(k);
        !r.done && cs.set(k, gs[k].next().then(r => [k, r]));
        return [k as keyof T, r as any] as const;
      });
  }
  return;
}
