import { stringify } from './stringify';

export { enqueue as Tick };

const queue: ((...args: any[]) => any)[] = [];
const fs = new WeakSet<() => any>();

let scheduled = false;

function enqueue(fn: () => any, dedup = false): void {
  assert(typeof fn === 'function');
  if (dedup && fs.has(fn)) return;
  void queue.push(fn);
  dedup && void fs.add(fn);
  void schedule();
}
function dequeue(): void {
  scheduled = false;
  let rem = queue.length;
  while (true) {
    try {
      while (rem > 0) {
        void --rem;
        const fn = queue.shift()!;
        assert(fn);
        void fs.delete(fn);
        void fn();
      }
    }
    catch (e) {
      console.error(stringify(e));
      continue;
    }
    break;
  }
}

function schedule(): void {
  if (scheduled) return;
  if (queue.length === 0) return;
  void Promise.resolve().then(dequeue);
  scheduled = true;
}
