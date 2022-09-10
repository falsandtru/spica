import { Date, Promise } from './global';
import { Queue } from './queue';
import { causeAsyncException } from './exception';

const undefined = void 0;

let time: number | undefined;
let count = 0;
export function now(nocache?: boolean): number {
  if (time === undefined) {
    tick(() => time = undefined);
  }
  else if (!nocache && count++ !== 20) {
    return time;
  }
  count = 1;
  return time = Date.now();
}

export const clock: Promise<undefined> = Promise.resolve(undefined);

type Callback = () => void;

export function promise(cb: Callback): void {
  Promise.resolve().then(cb);
}

const queue = new Queue<Callback>();
const scheduler = Promise.resolve();

export function tick(cb: Callback): void {
  queue.isEmpty() && scheduler.then(run);
  queue.push(cb);
}

function run(): void {
  for (let count = queue.length; count--;) {
    try {
      // @ts-expect-error
      (0, queue.pop()!)();
    }
    catch (reason) {
      causeAsyncException(reason);
    }
  }
}
