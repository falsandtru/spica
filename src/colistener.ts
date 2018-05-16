import { Coroutine } from './coroutine';
import { Future } from './future';
import { Cancellation } from './cancellation';

export class Colistener<T> extends Coroutine<void, T> {
  constructor(
    listen: (listener: (value: T) => void) => () => void
  ) {
    super(async function* (this: Colistener<T>) {
      void this.catch(() => void this.close());
      this[Coroutine.terminator] = undefined as never;
      assert(!this[Coroutine.terminator]);
      let state: Future<[T]> = new Future();
      let cell: [T] | undefined;
      void this.cancellation.register(listen(val => {
        if (cell) {
          cell[0] = val;
        }
        else {
          cell = [val];
          state.bind(cell);
          state = new Future();
        }
      }));
      const done = this.cancellation.then(() => []);
      while (!this.cancellation.canceled) {
        yield* await Promise.race([
          state,
          done,
        ]);
        // Ignore changes in processing.
        cell = undefined;
      }
    });
  }
  private readonly cancellation = new Cancellation();
  public readonly close: () => void = this.cancellation.cancel;
}
