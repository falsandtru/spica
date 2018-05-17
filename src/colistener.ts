import { Coroutine, CoroutineOptions } from './coroutine';
import { Future } from './future';
import { Cancellation } from './cancellation';

export class Colistener<T, U = void> extends Coroutine<U, T> {
  constructor(
    listen: (listener: (value: T) => void) => () => void,
    opts: CoroutineOptions = {}
  ) {
    super(async function* (this: Colistener<T, U>) {
      this[Coroutine.terminator] = undefined as never;
      assert(!this[Coroutine.terminator]);
      let notifier: Future<T[]> | undefined;
      assert(!notifier);
      const queue: T[] = [];
      const unlisten = listen(val => {
        if (notifier && queue.length === 0) {
          void notifier.bind(queue);
          notifier = undefined;
        }
        void queue.push(val);
        while (queue.length > (opts.size || 1)) {
          void queue.shift()!;
        }
        assert(queue.length > 0);
      });
      void this.catch(unlisten);
      void this.cancellation.register(unlisten);
      const done = this.cancellation.then(() => []);
      while (!this.cancellation.canceled) {
        assert(queue.length === 0);
        const q = await Promise.race([
          notifier = notifier || new Future(),
          done,
        ]);
        while (q.length > 0) {
          yield q.shift()!;
        }
        assert(queue.length === 0);
      }
      return this.cancellation;
    }, { ...opts, size: 0 });
  }
  private readonly cancellation: Cancellation<U> = new Cancellation();
  public readonly close = this.cancellation.cancel;
}
