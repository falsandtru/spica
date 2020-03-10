import { MList } from './list';
import { causeAsyncException } from './exception';

type Callback = () => void;

let list = MList<Callback>();
let last = list;

export function tick(cb: Callback): void {
  schedule();
  last = last.append(cb);
}

const scheduler = Promise.resolve();

function schedule(): void {
  if (list.tail) return;
  scheduler.then(run);
}

function run(): void {
  let node = list;
  list = last = MList();
  while (true) {
    try {
      for (; node.tail; node = node.tail) {
        node.head();
      }
      return;
    }
    catch (reason) {
      node = node.tail;
      void causeAsyncException(reason);
      continue;
    }
  }
}
