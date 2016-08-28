namespace TICK {
  export const queue = enqueue;

  const Queue: ((...args: any[]) => any)[] = [];
  let Reservation = 0;

  function enqueue(fn: (_?: void) => any): void {
    assert(typeof fn === 'function');
    void Queue.push(fn);
    void schedule();
  }
  function dequeue(): void {
    void schedule();
    void --Reservation;
    let task = Queue.length;
    while (task-- > 0) {
      void Queue.shift()!();
    }
  }

  const Delays = [0, 4, 10, 20, 25].reverse();
  function schedule(): void {
    if (Queue.length === 0) return;
    assert(0 <= Reservation && Reservation <= Delays.length);
    while (Reservation < Delays.length) {
      void setTimeout(dequeue, Delays[Reservation % Delays.length]);
      void ++Reservation;
    }
    assert(0 <= Reservation && Reservation <= Delays.length);
  }

}

const IS_NODE = Function("return typeof process === 'object' && typeof window !== 'object'")();
export const Tick = IS_NODE
  ? <typeof TICK.queue>Function('return fn => process.nextTick(fn)')()
  : TICK.queue;
