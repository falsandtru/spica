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
  private readonly providers: AtomicFuture<undefined>[] = [];
  private readonly consumers: AtomicFuture<T>[] = [];
  public close(): void {
    if (!this.alive) return;
    // @ts-expect-error
    this.alive = false;

    this.buffer.splice(0, this.buffer.length);
    for (let i = 0; this.providers[i] || this.consumers[i]; ++i) {
      this.providers[i]?.bind(failure);
      this.consumers[i]?.bind(failure);
    }
    this.providers.splice(0, this.providers.length);
    this.consumers.splice(0, this.consumers.length);
  }
  public put(this: Channel<undefined>, msg?: T): AtomicPromise<undefined>;
  public put(msg: T): AtomicPromise<undefined>;
  public put(msg: T): AtomicPromise<undefined> {
    if (!this.alive) return failure;
    switch (true) {
      case this.buffer.length < this.size:
      case this.size === 0 && this.buffer.length === 0 && this.consumers.length > 0:
        this.buffer.push(msg);
        this.consumers.length > 0 && this.consumers.shift()!.bind(this.buffer.shift()!)
        return success;
      default:
        return this.providers[this.providers.push(new AtomicFuture()) - 1]
          .then(() => this.put(msg));
    }
  }
  public take(): AtomicPromise<T> {
    if (!this.alive) return failure;
    switch (true) {
      case this.buffer.length > 0:
        const msg = this.buffer.shift()!;
        this.providers.length > 0 && this.providers.shift()!.bind();
        return AtomicPromise.resolve(msg);
      case this.size === 0 && this.providers.length > 0:
        const consumer = this.consumers[this.consumers.push(new AtomicFuture()) - 1];
        this.providers.shift()!.bind();
        return consumer.then();
      default:
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
