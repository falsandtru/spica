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
      const queue: T[] = [];
      const unlisten = listen(val => {
        queue.length === 0 && notifier && void notifier.bind(queue);
        void queue.push(val);
        while (queue.length > (opts.size || 1)) {
          void queue.shift()!;
        }
      });
      void this.catch(unlisten);
      void this.cancellation.register(unlisten);
      const done = this.cancellation.then(() => []);
      while (!this.cancellation.canceled) {
        assert(!notifier);
        notifier = new Future();
        const q = await Promise.race([
          notifier,
          done,
        ]);
        notifier = undefined;
        while (q.length > 0) {
          yield q.shift()!;
        }
      }
      return this.cancellation;
    }, { ...opts, size: 0 });
  }
  private readonly cancellation: Cancellation<U> = new Cancellation();
  public readonly close: {
    (this: Colistener<T, void>, value?: U): void;
    (value: U): void;
  } = this.cancellation.cancel as any;
}
