import { Map, Promise } from './global';
import { ObjectEntries } from './alias';

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
  const cs = new Map(ObjectEntries(gs)
    .map(([k, v]) =>
      [k, v.next().then(r => [k, r] as const)]));
  while (cs.size > 0) {
    const [k, r] = await Promise.race(cs.values());
    void cs.delete(k);
    !r.done && void cs.set(k, gs[k].next().then(r => [k, r]));
    yield [k as keyof T, r as AsyncGeneratorResult<T[keyof T]>];
  }
  return;
}
