import { AtomicPromise } from './promise';
import { AtomicFuture } from './future';

const success = AtomicPromise.resolve();
const fail = () => AtomicPromise.reject(new Error('Spica: Channel: Closed.'));

const internal = Symbol.for('spica/channel::internal');

export class Channel<T = undefined> implements AsyncIterable<T> {
  constructor(
    size: number = 0,
  ) {
    this[internal] = new Internal(size);
  }
  public readonly [internal]: Internal<T>;
  public get alive(): boolean {
    return this[internal].alive;
  }
  public close(): void {
    if (!this.alive) return;
    const core = this[internal];
    core.alive = false;
    core.buffer.splice(0, core.buffer.length);
    for (let i = 0; core.producers[i] || core.consumers[i]; ++i) {
      core.producers[i]?.bind(fail());
      core.consumers[i]?.bind(fail());
    }
    core.producers.splice(0, core.producers.length);
    core.consumers.splice(0, core.consumers.length);
  }
  public put(this: Channel<undefined>, msg?: T): AtomicPromise<undefined>;
  public put(msg: T): AtomicPromise<undefined>;
  public put(msg: T): AtomicPromise<undefined> {
    if (!this.alive) return fail();
    const core = this[internal];
    switch (true) {
      case core.buffer.length < core.size:
      case core.consumers.length > 0:
        assert(core.buffer.length + 1 < core.size ? core.producers.length === 0 : true);
        assert(core.size === 0 ? core.buffer.length === 0 : true);
        core.buffer.push(msg);
        core.consumers.length > 0 && core.consumers.shift()!.bind(core.buffer.shift()!)
        assert(core.buffer.length <= core.size);
        assert(core.buffer.length > 0 ? core.consumers.length === 0 : true);
        return success;
      default:
        assert(core.buffer.length === core.size);
        assert(core.consumers.length === 0);
        return core.producers[core.producers.push(new AtomicFuture()) - 1]
          .then(() => this.put(msg));
    }
  }
  public take(): AtomicPromise<T> {
    if (!this.alive) return fail();
    const core = this[internal];
    switch (true) {
      case core.buffer.length > 0:
        assert(core.consumers.length === 0);
        const msg = core.buffer.shift()!;
        core.producers.length > 0 && core.producers.shift()!.bind();
        return AtomicPromise.resolve(msg);
      case core.producers.length > 0:
        assert(core.consumers.length === 0);
        const consumer = core.consumers[core.consumers.push(new AtomicFuture()) - 1];
        core.producers.shift()!.bind();
        return consumer.then();
      default:
        assert(core.buffer.length === 0);
        assert(core.producers.length === 0);
        return core.consumers[core.consumers.push(new AtomicFuture()) - 1]
          .then();
    }
  }
  public async *[Symbol.asyncIterator](): AsyncGenerator<T, undefined, undefined> {
    try {
      while (this.alive) {
        yield this.take();
      }
    }
    catch (reason) {
      if (this.alive) throw reason;
    }
    return;
  }
}

class Internal<T> {
  constructor(
    public readonly size: number = 0,
  ) {
  }
  public alive: boolean = true;
  public readonly buffer: T[] = [];
  public readonly producers: AtomicFuture<undefined>[] = [];
  public readonly consumers: AtomicFuture<T>[] = [];
}
