import { Coroutine, CoroutineOptions } from './coroutine';
import { Future } from './future';
import { Cancellation } from './cancellation';

export class Colistener<T> extends Coroutine<void, T> {
  constructor(
    listen: (listener: (value: T) => void) => () => void,
    opts: CoroutineOptions = {}
  ) {
    super(async function* (this: Colistener<T>) {
      void this.catch(() => void this.close());
      this[Coroutine.terminator] = undefined as never;
      assert(!this[Coroutine.terminator]);
      let notifier: Future<T[]> = new Future();
      const queue: T[] = [];
      void this.cancellation.register(listen(val => {
        queue.length === 0 && void notifier.bind(queue);
        void queue.push(val);
        while (queue.length > (opts.size || 1)) {
          void queue.shift()!;
        }
      }));
      const done = this.cancellation.then(() => []);
      while (!this.cancellation.canceled) {
        const q = await Promise.race([
          notifier,
          done,
        ]);
        while (q.length > 0) {
          yield q.shift()!;
        }
        notifier = new Future();
      }
    }, { ...opts, size: 0 });
  }
  private readonly cancellation = new Cancellation();
  public readonly close: () => void = this.cancellation.cancel;
}
