import { stringify } from './stringify';

const Queue: ((...args: any[]) => any)[] = [];

let scheduled = false;

function enqueue(fn: (_?: void) => any): void {
  assert(typeof fn === 'function');
  void Queue.push(fn);
  void schedule();
}
function dequeue(): void {
  scheduled = false;
  let rem = Queue.length;
  while (true) {
    try {
      while (rem > 0) {
        void --rem;
        void Queue.shift()!();
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
  if (Queue.length === 0) return;
  void Promise.resolve().then(dequeue);
  scheduled = true;
}

const IS_NODE = Function("return typeof process === 'object' && typeof window !== 'object'")();
export const Tick = IS_NODE
  ? <typeof enqueue>Function('return fn => process.nextTick(fn)')()
  : enqueue;
