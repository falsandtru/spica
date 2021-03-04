import { Date, setTimeout } from './global';
import { floor } from './alias';
import { AtomicPromise } from './promise';
import { causeAsyncException } from './exception';
import { noop } from './noop';

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

export const never: Promise<never> = new class Never extends Promise<never> {
  public static get [Symbol.species]() {
    return Never;
  }
  constructor() {
    super(noop);
  }
  public then() {
    return this;
  }
  public catch() {
    return this;
  }
  public finally() {
    return this;
  }
}();

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
