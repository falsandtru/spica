import { Symbol, Set, Promise } from './global';
import { ObjectEntries } from './alias';

interface AsyncIterable<T = unknown, U = any, S = unknown> {
  [Symbol.asyncIterator](): AsyncIterator<T, U, S>;
}

type Channel =
  | AsyncIterable<unknown, unknown, undefined>
  | (() => AsyncIterable<unknown, unknown, undefined>);
type Channels =
  | readonly [] | readonly [Channel, ...Channel[]]
  | readonly Channel[]
  | Record<string, Channel>;
type ChannelResult<T extends Channels> =
  T extends readonly unknown[] ? number extends T['length'] ?
  { readonly name: string; readonly result: T[number] extends Channel ? ChannelIteratorResult<T[number]> : never; } :
  { [P in keyof T]: T[P] extends Channel ? { readonly name: P; readonly result: ChannelIteratorResult<T[P]>; } : never; }[number] :
  { [P in keyof T]: T[P] extends Channel ? { readonly name: P; readonly result: ChannelIteratorResult<T[P]>; } : never; }[keyof T];
type ChannelIteratorResult<C extends Channel> =
  C extends () => AsyncIterable<infer T, infer U> ? IteratorResult<T, U> :
  C extends AsyncIterable<infer T, infer U> ? IteratorResult<T, U> :
  never;

export async function* select<T extends Channels>(
  channels: T,
): AsyncGenerator<ChannelResult<T>, undefined, undefined> {
  const reqs = new Set(ObjectEntries(channels)
    .map(([name, chan]) => (
      chan = typeof chan === 'function' ? chan() : chan,
      take(name, chan[Symbol.asyncIterator]()))));
  while (reqs.size > 0) {
    const [req, name, chan, result] = await Promise.race(reqs);
    assert(reqs.has(req));
    reqs.delete(req);
    !result.done && reqs.add(take(name, chan));
    yield { name, result } as ChannelResult<T>;
  }
  return;
}

type Request = Promise<readonly [Request, string, AsyncIterator<unknown, unknown, undefined>, IteratorResult<unknown, unknown>]>;
function take(name: string, chan: AsyncIterator<unknown, unknown, undefined>): Request {
  const req: Request = chan.next().then(result => [req, name, chan, result]);
  return req;
}
