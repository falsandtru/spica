import { causeAsyncException } from './exception';
import { noop } from './noop';

type Callback = () => void;

const scheduler = Promise.resolve();
const id = <a>(a: a) => a;
let cont: (next?: typeof cont) => typeof next = id;

export function tick(cb: Callback): void {
  cont === id && scheduler.then(run);
  cont = ((prev, cb): typeof cont => next => () => prev(() => ([cb, cb = noop][0](), next)))(cont, cb);
}

function run(): void {
  let c = [cont, cont = id][0];
  while (c) {
    try {
      while (c = c()!);
      return;
    }
    catch (reason) {
      causeAsyncException(reason);
      continue;
    }
  }
}
