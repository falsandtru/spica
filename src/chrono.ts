import { Queue } from './queue';
import { causeAsyncException } from './exception';

let time: number | undefined;
let count = 0;
export function now(nocache?: boolean): number {
  if (time === undefined) {
    clock.now(() => time = undefined);
  }
  else if (!nocache && count++ !== 20) {
    return time;
  }
  count = 1;
  return time = Date.now();
}

export const clock = new class Clock extends Promise<undefined> {
  constructor() {
    super(resolve => resolve(undefined));
    // Promise subclass is slow.
    const clock = Promise.resolve() as Clock;
    clock.next = this.next;
    clock.now = this.now;
    return clock;
  }
  public next(callback: () => void): void {
    scheduled || schedule();
    clock.then(callback);
  }
  public now(callback: () => void): void {
    scheduled || schedule();
    queue.push(callback);
  }
};

const queue = new Queue<() => void>();
let scheduled = false;

function schedule(): void {
  scheduled = true;
  clock.then(run);
}

function run(): void {
  for (let cb: () => void; cb = queue.pop()!;) {
    try {
      cb();
    }
    catch (reason) {
      causeAsyncException(reason);
    }
  }
  scheduled = false;
}
