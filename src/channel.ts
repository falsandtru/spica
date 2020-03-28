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

export async function* select
  <T extends Record<string, Channel>>
  (channels: T): AsyncGenerator<ChannelResult<T>, undefined, undefined> {
  const gens: Record<string, AsyncGenerator<unknown, unknown, undefined>> = ObjectEntries(channels)
    .reduce((gens, [name, chan]) => (
      chan = typeof chan === 'function' ? chan() : chan,
      gens[name] = chan[Symbol.asyncIterator](),
      gens
    ), {});
  const jobs = new Set(ObjectEntries(gens).map(([name, chan]) => Job(name, chan)));
  while (jobs.size > 0) {
    const [name, result, job] = await Promise.race(jobs);
    assert(jobs.has(job));
    void jobs.delete(job);
    !result.done && void jobs.add(Job(name, gens[name]));
    yield [name as keyof T, result as ChannelIteratorResult<T[keyof T]>];
  }
  return;
}

type Job = Promise<readonly [string, IteratorResult<unknown, unknown>, Job]>;
function Job(name: string, chan: AsyncIterator<unknown, unknown, undefined>): Job {
  const job: Job = chan.next().then(result => [name, result, job]);
  return job;
}
