import { Symbol, Set, Promise as ESPromise } from './global';
import { ObjectEntries } from './alias';

interface AsyncIterable<T = unknown, U = any, S = unknown> {
  [Symbol.asyncIterator](): AsyncIterator<T, U, S>;
}

type Channel =
  | AsyncIterable<unknown, unknown, undefined>
  | (() => AsyncIterable<unknown, unknown, undefined>);
type Channels = Record<string, Channel>;
type ChannelResult<T extends Channels> =
  { [P in keyof T]: readonly [P, ChannelIteratorResult<T[P]>]; }[keyof T];
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
    const [name, chan, req, result] = await ESPromise.race(reqs);
    assert(reqs.has(req));
    void reqs.delete(req);
    !result.done && void reqs.add(take(name, chan));
    yield [name as keyof T, result as ChannelIteratorResult<T[keyof T]>];
  }
  return;
}

type Request = Promise<readonly [string, AsyncIterator<unknown, unknown, undefined>, Request, IteratorResult<unknown, unknown>]>;
function take(name: string, chan: AsyncIterator<unknown, unknown, undefined>): Request {
  const req: Request = chan.next().then(result => [name, chan, req, result]);
  return req;
}
