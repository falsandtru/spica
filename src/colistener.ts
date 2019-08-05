import { AtomicFuture } from './future';
import { Coroutine, CoroutineOptions } from './coroutine';

export class Colistener<T, U = undefined> extends Coroutine<U, T> {
  constructor(
    listen: (this: Colistener<T, U>, listener: (value: T) => void) => () => void,
    opts: CoroutineOptions = {},
  ) {
    super(async function* (this: Colistener<T, U>) {
      let notifier: AtomicFuture<T[]> | undefined;
      assert(!notifier);
      const queue: T[] = [];
      void this.finally(listen.call(this, (value: T) => {
        if (notifier && queue.length === 0) {
          void notifier.bind(queue);
          notifier = undefined;
        }
        void queue.push(value);
        while (queue.length > (opts.size || 1)) {
          void queue.shift()!;
        }
        assert(queue.length > 0);
      }));
      while (queue.length > 0 && this[Coroutine.alive]) {
        yield queue.shift()!;
      }
      while (this[Coroutine.alive]) {
        assert(queue.length === 0);
        const q = await (notifier = notifier || new AtomicFuture());
        assert(q === queue || q.length === 0);
        while (q.length > 0 && this[Coroutine.alive]) {
          yield q.shift()!;
        }
        assert(queue.length === 0 || !this[Coroutine.alive]);
      }
      throw new Error(`Spica: Colistener: Unreachable.`);
    }, { ...opts, size: 0 });
    void this[Coroutine.init]();
  }
  public close(this: Colistener<T, void>, value?: U): void;
  public close(value: U): void;
  public close(value: U): void {
    void this[Coroutine.exit](value);
  }
}
