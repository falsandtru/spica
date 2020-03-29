import { causeAsyncException } from './exception';
import { splice } from './array';

type Callback = () => void;

let queue: Callback[] = [];
let jobs: Callback[] = [];
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
      jobs[i]();
    }
    catch (reason) {
      causeAsyncException(reason);
    }
  }
  jobs.length > 1000 && count < jobs.length * 0.5 && splice(jobs, jobs.length * 0.9 | 0, jobs.length);
}
