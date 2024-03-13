import { AtomicPromise } from './promise';
import { AtomicFuture } from './future';
import { Queue } from './queue';

const fail = () => AtomicPromise.reject(new Error('Spica: Channel: Closed'));

export class Channel<T = undefined> implements AsyncIterable<T> {
  constructor(
    private readonly capacity: number = 0,
  ) {
    assert(capacity >= 0);
  }
  private readonly buffer = new Queue<T>();
  private readonly producers = new Queue<AtomicFuture<undefined>>();
  private readonly consumers = new Queue<AtomicFuture<T>>();
  public alive: boolean = true;
  public close(finalizer?: (msgs: T[]) => void): void {
    if (!this.alive) return void finalizer?.([]);
    const { buffer, producers, consumers } = this;
    this.alive = false;
    while (!producers.isEmpty() || !consumers.isEmpty()) {
      producers.pop()?.bind(fail());
      consumers.pop()?.bind(fail());
    }
    if (finalizer) {
      AtomicPromise.all(buffer)
        .then(finalizer);
    }
  }
  public put(msg: T): AtomicPromise<undefined>;
  public put(this: Channel<undefined>, msg?: T): AtomicPromise<undefined>;
  public put(msg: T): AtomicPromise<undefined> {
    if (!this.alive) return fail();
    const { capacity, buffer, producers, consumers } = this;
    switch (true) {
      case buffer.length < capacity:
      case !consumers.isEmpty():
        assert(buffer.length + 1 < capacity ? producers.isEmpty() : true);
        assert(capacity === 0 ? buffer.isEmpty() : true);
        buffer.push(msg);
        consumers.pop()?.bind(buffer.pop()!);
        assert(buffer.length <= capacity);
        assert(!buffer.isEmpty() ? consumers.isEmpty() : true);
        return AtomicPromise.resolve();
      default:
        assert(buffer.length === capacity);
        assert(consumers.isEmpty());
        producers.push(new AtomicFuture());
        return producers.peek(-1)!
          .then(() => this.put(msg));
    }
  }
  public take(): AtomicPromise<T> {
    if (!this.alive) return fail();
    const { buffer, producers, consumers } = this;
    switch (true) {
      case !buffer.isEmpty():
        assert(consumers.isEmpty());
        const msg = buffer.pop()!;
        producers.pop()?.bind();
        return AtomicPromise.resolve(msg);
      case !producers.isEmpty():
        assert(consumers.isEmpty());
        consumers.push(new AtomicFuture());
        const consumer = consumers.peek(-1)!;
        producers.pop()!.bind();
        return consumer.then();
      default:
        assert(buffer.isEmpty());
        assert(producers.isEmpty());
        consumers.push(new AtomicFuture());
        return consumers.peek(-1)!.then();
    }
  }
  public get size(): number {
    return this.buffer.length;
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
  }
}
