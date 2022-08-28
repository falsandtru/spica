import { AtomicPromise } from './promise';
import { AtomicFuture } from './future';

const fail = () => AtomicPromise.reject(new Error('Spica: Channel: Closed.'));

export class Channel<T = undefined> implements AsyncIterable<T> {
  constructor(
    private readonly capacity: number = 0,
  ) {
    assert(capacity >= 0);
  }
  private readonly buffer: T[] = [];
  private readonly producers: AtomicFuture<undefined>[] = [];
  private readonly consumers: AtomicFuture<T>[] = [];
  public isAlive: boolean = true;
  public close(finalizer?: (msgs: T[]) => void): void {
    if (!this.isAlive) return;
    const { buffer, producers, consumers } = this;
    this.isAlive = false;
    while (producers.length || consumers.length) {
      producers.length && producers.shift()!.bind(fail());
      consumers.length && consumers.shift()!.bind(fail());
    }
    if (finalizer) {
      AtomicPromise.all(buffer)
        .then(finalizer);
    }
  }
  public put(msg: T): AtomicPromise<undefined>;
  public put(this: Channel<undefined>, msg?: T): AtomicPromise<undefined>;
  public put(msg: T): AtomicPromise<undefined> {
    if (!this.isAlive) return fail();
    const { capacity, buffer, producers, consumers } = this;
    switch (true) {
      case buffer.length < capacity:
      case consumers.length > 0:
        assert(buffer.length + 1 < capacity ? producers.length === 0 : true);
        assert(capacity === 0 ? buffer.length === 0 : true);
        buffer.push(msg);
        consumers.length > 0 && consumers.shift()!.bind(buffer.shift()!);
        assert(buffer.length <= capacity);
        assert(buffer.length > 0 ? consumers.length === 0 : true);
        return AtomicPromise.resolve();
      default:
        assert(buffer.length === capacity);
        assert(consumers.length === 0);
        return producers[producers.push(new AtomicFuture()) - 1]
          .then(() => this.put(msg));
    }
  }
  public take(): AtomicPromise<T> {
    if (!this.isAlive) return fail();
    const { buffer, producers, consumers } = this;
    switch (true) {
      case buffer.length > 0:
        assert(consumers.length === 0);
        const msg = buffer.shift()!;
        producers.length > 0 && producers.shift()!.bind();
        return AtomicPromise.resolve(msg);
      case producers.length > 0:
        assert(consumers.length === 0);
        const consumer = consumers[consumers.push(new AtomicFuture()) - 1];
        producers.shift()!.bind();
        return consumer.then();
      default:
        assert(buffer.length === 0);
        assert(producers.length === 0);
        return consumers[consumers.push(new AtomicFuture()) - 1]
          .then();
    }
  }
  public get size(): number {
    return this.buffer.length;
  }
  public async *[Symbol.asyncIterator](): AsyncGenerator<T, undefined, undefined> {
    try {
      while (this.isAlive) {
        yield this.take();
      }
    }
    catch (reason) {
      if (this.isAlive) throw reason;
    }
    return;
  }
}
