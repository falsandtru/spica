import { Date } from './global';
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

let buffer: (Callback | undefined)[] = [];
let queue: (Callback | undefined)[] = [];
let index = 0;

const scheduler = Promise.resolve();

export function tick(cb: Callback): void {
  index === 0 && scheduler.then(run);
  buffer[index++] = cb;
}

function run(): void {
  [index, buffer, queue] = [0, queue, buffer];
  for (let i = 0, cb: Callback | undefined; cb = queue[i]; ++i) {
    try {
      queue[i] = void cb();
    }
    catch (reason) {
      causeAsyncException(reason);
    }
  }
}
