import { AtomicFuture } from './future';
import { Coroutine, CoroutineOptions } from './coroutine';
import { Queue } from './queue';

export class Colistener<T, U = undefined> extends Coroutine<U, T> {
  constructor(
    listen: (this: Colistener<T, U>, listener: (value: T) => void) => () => void,
    opts: CoroutineOptions = {},
  ) {
    super(async function* (this: Colistener<T, U>) {
      const queue = new Queue<T>;
      let notifier: AtomicFuture<undefined> = new AtomicFuture();
      let notifiable: boolean = true;
      this.finally(listen.call(this, (value: T) => {
        assert(this[Coroutine.alive]);
        if (notifiable) {
          notifier.bind();
          notifiable = false;
        }
        queue.push(value);
        while (queue.length > (opts.capacity || 1)) {
          queue.pop()!;
        }
        assert(queue.length > 0);
      }));
      while (true) {
        await notifier;
        notifier = new AtomicFuture();
        notifiable = true;
        while (queue.length > 0) {
          yield queue.pop()!;
        }
      }
    }, { ...opts, capacity: -1, run: false });
    this[Coroutine.init]();
  }
  public close(this: Colistener<T, undefined>, value?: U): void;
  public close(value: U): void;
  public close(value: U): void {
    this[Coroutine.exit](value);
  }
}
