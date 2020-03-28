import { Set, Promise } from './global';
import { ObjectEntries } from './alias';

interface AsyncIterable<T = unknown, U = any, S = unknown> {
  [Symbol.asyncIterator](): AsyncIterator<T, U, S>;
}

type Channel =
  | AsyncIterable<unknown, unknown, undefined>
  | (() => AsyncIterable<unknown, unknown, undefined>);
type ChannelResult<T extends Record<string, Channel>> =
  { [P in keyof T]: readonly [P, ChannelIteratorResult<T[P]>]; }[keyof T];
type ChannelIteratorResult<G extends Channel> =
  G extends () => AsyncIterable<infer T, infer U> ? IteratorResult<T, U> :
  G extends AsyncIterable<infer T, infer U> ? IteratorResult<T, U> :
  never;

export async function* select<T extends Record<string, Channel>>(
  channels: T,
): AsyncGenerator<ChannelResult<T>, undefined, undefined> {
  const jobs = new Set(ObjectEntries(channels)
    .map(([name, chan]) => (
      chan = typeof chan === 'function' ? chan() : chan,
      take(name, chan[Symbol.asyncIterator]()))));
  while (jobs.size > 0) {
    const [name, chan, job, result] = await Promise.race(jobs);
    assert(jobs.has(job));
    void jobs.delete(job);
    !result.done && void jobs.add(take(name, chan));
    yield [name, result as ChannelIteratorResult<T[keyof T]>];
  }
  return;
}

type Job = Promise<readonly [string, AsyncIterator<unknown, unknown, undefined>, Job, IteratorResult<unknown, unknown>]>;
function take(name: string, chan: AsyncIterator<unknown, unknown, undefined>): Job {
  const job: Job = chan.next().then(result => [name, chan, job, result]);
  return job;
}
