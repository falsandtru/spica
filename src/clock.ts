import { Date } from './global';
import { floor } from './alias';
import { causeAsyncException } from './exception';

let mem: number | undefined;
let count = 0;
export function now(nocache = false): number {
  if (mem === void 0) {
    tick(() => mem = void 0);
  }
  else if (!nocache && ++count !== 100) {
    return mem;
  }
  count = 0;
  return mem = Date.now();
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
