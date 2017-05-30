import { stringify } from './stringify';

export { enqueue as tick };

const queue: [() => void, boolean][] = [];
let fs = new WeakSet<() => void>();

let scheduled = false;

function enqueue(fn: () => void, dedup = false): void {
  assert(typeof fn === 'function');
  void queue.push([fn, dedup]);
  void schedule();
}
function dequeue(): void {
  scheduled = false;
  let rem = queue.length;
  while (true) {
    try {
      while (rem > 0) {
        void --rem;
        const [fn, dedup] = queue.shift()!;
        if (dedup) {
          if (fs.has(fn)) continue;
          void fs.add(fn);
        }
        assert(fn);
        void fn();
      }
    }
    catch (e) {
      assert(!console.debug(stringify(e)));
      void console.error(e);
      continue;
    }
    fs = new WeakSet();
    break;
  }
}

function schedule(): void {
  if (scheduled) return;
  if (queue.length === 0) return;
  void Promise.resolve().then(dequeue);
  scheduled = true;
}
