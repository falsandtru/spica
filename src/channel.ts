import { ObjectFreeze } from './alias';
import { AtomicPromise } from './promise';
import { AtomicFuture } from './future';

const success = AtomicPromise.resolve();
const failure = AtomicPromise.reject(ObjectFreeze(new Error('Spica: Channel: Closed.')));

export class Channel<T = undefined> implements AsyncIterable<T> {
  constructor(
    private readonly size: number = 0,
  ) {
  }
  private readonly alive: boolean = true;
  private readonly buffer: T[] = [];
  private readonly producers: AtomicFuture<undefined>[] = [];
  private readonly consumers: AtomicFuture<T>[] = [];
  public close(): void {
    if (!this.alive) return;
    // @ts-expect-error
    this.alive = false;

    this.buffer.splice(0, this.buffer.length);
    for (let i = 0; this.producers[i] || this.consumers[i]; ++i) {
      this.producers[i]?.bind(failure);
      this.consumers[i]?.bind(failure);
    }
    this.producers.splice(0, this.producers.length);
    this.consumers.splice(0, this.consumers.length);
  }
  public put(this: Channel<undefined>, msg?: T): AtomicPromise<undefined>;
  public put(msg: T): AtomicPromise<undefined>;
  public put(msg: T): AtomicPromise<undefined> {
    if (!this.alive) return failure;
    switch (true) {
      case this.buffer.length < this.size:
      case this.consumers.length > 0:
        assert(this.buffer.length + 1 < this.size ? this.producers.length === 0 : true);
        assert(this.size === 0 ? this.buffer.length === 0 : true);
        this.buffer.push(msg);
        this.consumers.length > 0 && this.consumers.shift()!.bind(this.buffer.shift()!)
        assert(this.buffer.length > 0 ? this.consumers.length === 0 : true);
        return success;
      default:
        assert(this.consumers.length === 0);
        return this.producers[this.producers.push(new AtomicFuture()) - 1]
          .then(() => this.put(msg));
    }
  }
  public take(): AtomicPromise<T> {
    if (!this.alive) return failure;
    switch (true) {
      case this.buffer.length > 0:
        assert(this.consumers.length === 0);
        const msg = this.buffer.shift()!;
        this.producers.length > 0 && this.producers.shift()!.bind();
        return AtomicPromise.resolve(msg);
      case this.producers.length > 0:
        assert(this.consumers.length === 0);
        const consumer = this.consumers[this.consumers.push(new AtomicFuture()) - 1];
        this.producers.shift()!.bind();
        return consumer.then();
      default:
        assert(this.producers.length === 0);
        return this.consumers[this.consumers.push(new AtomicFuture()) - 1]
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
