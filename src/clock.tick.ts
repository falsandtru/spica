import { MList } from './list';
import { causeAsyncException } from './exception';

type Callback = () => void;

let queue = MList<Callback>();

export function tick(cb: Callback): void {
  schedule();
  queue = queue.add(cb);
}

const scheduler = Promise.resolve();

function schedule(): void {
  if (queue.tail) return;
  void scheduler.then(run);
}

function run(): void {
  let cbs = queue.reverse();
  queue = MList();
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
