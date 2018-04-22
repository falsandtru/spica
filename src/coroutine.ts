import { Future } from './future'; 
import { tick } from './tick'; 

const clock = Promise.resolve();

export class Coroutine<T, S = void> extends Promise<Exclude<T, S>> {
  static get [Symbol.species]() {
    return Promise;
  }
  constructor(
    gen: () => Iterator<T> | AsyncIterator<T>,
    resume: () => Promise<void> = () => clock,
  ) {
    super((resolve, reject) =>
      void tick(() => void this.state.then(resolve, reject)));
    const iter = gen();
    void (async () => {
      try {
        while (true) {
          await resume();
          if (!this.alive) return;
          const { value, done } = await iter.next();
          if (!this.alive) return;
          if (!done) continue;
          this.alive = false;
          void this.state.bind(value as Exclude<T, S>);
        }
      }
      catch (e) {
        void this.terminate(e);
      }
    })();
  }
  private alive = true;
  private readonly state = new Future<Exclude<T, S>>();
  public terminate(reason?: any): void {
    if (!this.alive) return;
    this.alive = false;
    void this.state.bind(Promise.reject(reason));
  }
}

// Should be moved to each file which implements a consumer class after AsyncIterator is recommended officially. 
import { Supervisor } from './supervisor'; 
Coroutine.prototype[Supervisor.terminator] = Coroutine.prototype.terminate;
