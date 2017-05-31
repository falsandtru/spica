import { stringify } from './stringify';

type Callback = () => void;

let queue: Callback[] = [];
let register = new WeakSet<Callback>();

function flush(): Callback[] {
  const cbs = queue;
  queue = [];
  register = new WeakSet();
  return cbs;
}

export function tick(cb: Callback, dedup = false): void {
  if (dedup) {
    if (register.has(cb)) return;
    void register.add(cb);
  }
  void queue.push(cb);
  void schedule();
}

function schedule(): void {
  if (queue.length !== 1) return;
  void Promise.resolve()
    .then(run);
}

function run(): void {
  const cbs = flush();
  while (true) {
    try {
      while (cbs.length > 0) {
        void cbs.shift()!();
      }
    }
    catch (e) {
      assert(!console.debug(stringify(e)));
      void console.error(e);
      continue;
    }
    break;
  }
}
