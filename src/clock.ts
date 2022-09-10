import { Date, Promise } from './global';
import { Queue } from './queue';
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
