import { AtomicPromise } from './promise';
import { AtomicFuture } from './future';
import { Coroutine, CoroutineOptions } from './coroutine';
import { Cancellation } from './cancellation';

export class Colistener<T, U = void> extends Coroutine<U, T> {
  constructor(
    listen: (this: Colistener<T, U>, listener: (value: T) => void) => () => void,
    opts: CoroutineOptions = {},
  ) {
    super(async function* (this: Colistener<T, U>) {
      let notifier: AtomicFuture<T[]> | undefined;
      assert(!notifier);
      const queue: T[] = [];
      this[Coroutine.destructor] = listen.call(this, (value: T) => {
        if (notifier && queue.length === 0) {
          void notifier.bind(queue);
          notifier = undefined;
        }
        void queue.push(value);
        while (queue.length > (opts.size || 1)) {
          void queue.shift()!;
        }
        assert(queue.length > 0);
      });
      void this.cancellation.register(this[Coroutine.destructor]);
      const done = this.cancellation.then(() => []);
      while (queue.length > 0 && !this.cancellation.canceled) {
        yield queue.shift()!;
      }
      while (!this.cancellation.canceled) {
        assert(queue.length === 0);
        const q = await AtomicPromise.race([
          notifier = notifier || new AtomicFuture(),
          done,
        ]);
        assert(q === queue || q.length === 0);
        while (q.length > 0 && !this.cancellation.canceled) {
          yield q.shift()!;
        }
        assert(queue.length === 0 || this.cancellation.canceled);
      }
      return this.cancellation;
    }, { ...opts, size: 0, autorun: false });
    void this[Coroutine.run]();
  }
  private readonly cancellation: Cancellation<U> = new Cancellation();
  public readonly close: {
    (this: Colistener<T, void>, value?: U): void;
    (value: U): void;
  } = this.cancellation.cancel;
}
