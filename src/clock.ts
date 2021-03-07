import { Date, setTimeout } from './global';
import { AtomicPromise } from './promise';
import { causeAsyncException } from './exception';
import { Queue } from './queue';

let now_: number | undefined;
export function now(): number {
  if (now_ !== void 0) return now_;
  tick(() => now_ = void 0);
  return now_ = Date.now();
}

export const clock: Promise<undefined> = Promise.resolve(undefined);

export function wait(ms: number): AtomicPromise<undefined> {
  assert(ms >= 0);
  return ms === 0
    ? AtomicPromise.resolve(clock)
    : new AtomicPromise(resolve => void setTimeout(resolve, ms));
}

type Callback = () => void;

let queue = new Queue<Callback>();
let jobs = new Queue<Callback>();

const scheduler = Promise.resolve();
let schedule = false;

export function tick(cb: Callback): void {
  queue.enqueue(cb);
  //schedule ||= !!scheduler.then(run);
  schedule = schedule || !!scheduler.then(run);
}

function run(): void {
  schedule = false;
  [jobs, queue] = [queue, jobs];
  for (let job: Callback | undefined; job = jobs.dequeue();) {
    try {
      job();
    }
    catch (reason) {
      causeAsyncException(reason);
    }
  }
}
