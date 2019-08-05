import { AtomicFuture } from './future';
import { Coroutine, CoroutineOptions } from './coroutine';

export class Colistener<T, U = undefined> extends Coroutine<U, T> {
  constructor(
    listen: (this: Colistener<T, U>, listener: (value: T) => void) => () => void,
    opts: CoroutineOptions = {},
  ) {
    super(async function* (this: Colistener<T, U>) {
      const queue: T[] = [];
      let notifier: AtomicFuture<undefined> = new AtomicFuture();
      let notifiable: boolean = true;
      void this.finally(listen.call(this, (value: T) => {
        assert(this[Coroutine.alive]);
        if (notifiable) {
          void notifier.bind();
          notifiable = false;
        }
        void queue.push(value);
        while (queue.length > (opts.size || 1)) {
          void queue.shift()!;
        }
        assert(queue.length > 0);
      }));
      while (true) {
        await notifier;
        notifier = new AtomicFuture();
        notifiable = true;
        while (queue.length > 0) {
          yield queue.shift()!;
        }
      }
    }, { ...opts, size: 0 });
    void this[Coroutine.init]();
  }
  public close(this: Colistener<T, void>, value?: U): void;
  public close(value: U): void;
  public close(value: U): void {
    void this[Coroutine.exit](value);
  }
}
