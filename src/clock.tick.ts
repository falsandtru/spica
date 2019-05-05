import { causeAsyncException } from './exception';

type Callback = () => void;

let queue: Callback[] = [];

export function tick(cb: Callback): void {
  void queue.push(cb);
  void schedule();
}

const scheduler = Promise.resolve();

function schedule(): void {
  if (queue.length !== 1) return;
  void scheduler.then(run);
}

function run(): void {
  const cbs = flush();
  while (true) {
    try {
      while (cbs.length > 0) {
        void cbs.shift()!();
      }
    }
    catch (reason) {
      void causeAsyncException(reason);
      continue;
    }
    return;
  }
}

function flush(): Callback[] {
  const cbs = queue;
  queue = [];
  return cbs;
}
