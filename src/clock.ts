import { Date } from './global';
import { floor } from './alias';
import { causeAsyncException } from './exception';

let now_: number | undefined;
let count = 0;
export function now(): number {
  if (now_ === void 0) {
    tick(() => now_ = void 0);
  }
  else {
    if (++count !== 100) return now_;
    count = 0;
  }
  return now_ = Date.now();
}

export const clock: Promise<undefined> = Promise.resolve(void 0);

type Callback = () => void;

let queue: (Callback | undefined)[] = [];
let jobs: (Callback | undefined)[] = [];
let index = 0;

const scheduler = Promise.resolve();

export function tick(cb: Callback): void {
  index === 0 && scheduler.then(run);
  index++ === queue.length
    ? queue.push(cb)
    : queue[index - 1] = cb;
}

function run(): void {
  const count = index;
  [index, queue, jobs] = [0, jobs, queue];
  for (let i = 0; i < count; ++i) {
    try {
      jobs[i]!();
      // Release the reference.
      jobs[i] = void 0;
    }
    catch (reason) {
      causeAsyncException(reason);
    }
  }
  // Gradually reduce the unused buffer space.
  jobs.length > 1000 && count < jobs.length * 0.5 && jobs.splice(floor(jobs.length * 0.9), jobs.length);
}
