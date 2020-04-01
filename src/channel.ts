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
    this[internal].alive = false;
    this[internal].buffer.splice(0, this[internal].buffer.length);
    for (let i = 0; this[internal].producers[i] || this[internal].consumers[i]; ++i) {
      this[internal].producers[i]?.bind(fail());
      this[internal].consumers[i]?.bind(fail());
    }
    this[internal].producers.splice(0, this[internal].producers.length);
    this[internal].consumers.splice(0, this[internal].consumers.length);
  }
  public put(this: Channel<undefined>, msg?: T): AtomicPromise<undefined>;
  public put(msg: T): AtomicPromise<undefined>;
  public put(msg: T): AtomicPromise<undefined> {
    if (!this.alive) return fail();
    switch (true) {
      case this[internal].buffer.length < this[internal].size:
      case this[internal].consumers.length > 0:
        assert(this[internal].buffer.length + 1 < this[internal].size ? this[internal].producers.length === 0 : true);
        assert(this[internal].size === 0 ? this[internal].buffer.length === 0 : true);
        this[internal].buffer.push(msg);
        this[internal].consumers.length > 0 && this[internal].consumers.shift()!.bind(this[internal].buffer.shift()!)
        assert(this[internal].buffer.length <= this[internal].size);
        assert(this[internal].buffer.length > 0 ? this[internal].consumers.length === 0 : true);
        return success;
      default:
        assert(this[internal].buffer.length === this[internal].size);
        assert(this[internal].consumers.length === 0);
        return this[internal].producers[this[internal].producers.push(new AtomicFuture()) - 1]
          .then(() => this.put(msg));
    }
  }
  public take(): AtomicPromise<T> {
    if (!this.alive) return fail();
    switch (true) {
      case this[internal].buffer.length > 0:
        assert(this[internal].consumers.length === 0);
        const msg = this[internal].buffer.shift()!;
        this[internal].producers.length > 0 && this[internal].producers.shift()!.bind();
        return AtomicPromise.resolve(msg);
      case this[internal].producers.length > 0:
        assert(this[internal].consumers.length === 0);
        const consumer = this[internal].consumers[this[internal].consumers.push(new AtomicFuture()) - 1];
        this[internal].producers.shift()!.bind();
        return consumer.then();
      default:
        assert(this[internal].buffer.length === 0);
        assert(this[internal].producers.length === 0);
        return this[internal].consumers[this[internal].consumers.push(new AtomicFuture()) - 1]
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
