import { Coroutine } from './coroutine';
import { Future } from './future';
import { Cancellation } from './cancellation';

export class Colistener<T> extends Coroutine<void, T> {
  constructor(
    register: (listener: (value: T) => void) => () => void
  ) {
    super(async function* (this: Colistener<T>) {
      void this.catch(() => void this.close());
      delete this[Coroutine.port as any];
      assert(!this[Coroutine.port]);
      this[Coroutine.terminator] = undefined as never;
      assert(!this[Coroutine.terminator]);
      let state: Future<[T]> = new Future();
      let cell: [T] | undefined;
      const unregister = register(val => {
        if (cell) {
          cell[0] = val;
        }
        else {
          cell = [val];
          state.bind(cell);
          state = new Future();
        }
      });
      void this.cancellation.register(unregister);
      const done = this.cancellation.then(() => []);
      while (!this.cancellation.canceled) {
        yield* await Promise.race([
          state,
          done,
        ]);
        // Ignore changes in processing.
        cell = undefined;
      }
      void unregister();
    });
  }
  private readonly cancellation = new Cancellation();
  public close: () => void = this.cancellation.cancel;
}
