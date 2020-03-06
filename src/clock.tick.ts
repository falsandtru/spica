import { MList } from './list';
import { causeAsyncException } from './exception';

type Callback = () => void;

let list = MList<Callback>();

export function tick(cb: Callback): void {
  schedule();
  list = list.add(cb);
}

const scheduler = Promise.resolve();

function schedule(): void {
  if (list.tail) return;
  scheduler.then(run);
}

function run(): void {
  let cbs = list.reverse();
  list = MList();
  while (true) {
    try {
      for (; cbs.head; cbs = cbs.tail) {
        cbs.head();
      }
      return;
    }
    catch (reason) {
      void causeAsyncException(reason);
      continue;
    }
  }
}
