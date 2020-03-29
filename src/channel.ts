import { AtomicPromise } from './promise';
import { AtomicFuture } from './future';

const success = AtomicPromise.resolve();
const failure = AtomicPromise.reject(new Error('Spica: Channel: Closed.'));

export class Channel<T = undefined> implements AsyncIterable<T> {
  constructor(
    private readonly size: number = 0,
  ) {
  }
  private readonly alive: boolean = true;
  private readonly buffer: T[] = [];
  private readonly senders: AtomicFuture<undefined>[] = [];
  private readonly takers: AtomicFuture<undefined>[] = [];
  public close(): void {
    if (!this.alive) return;
    // @ts-expect-error
    this.alive = false;

    this.buffer.splice(0, this.buffer.length);
    for (let i = 0; this.takers[i] || this.senders[i]; ++i) {
      this.takers[i]?.bind(failure);
      this.senders[i]?.bind(failure);
    }
    this.takers.splice(0, this.takers.length);
    this.senders.splice(0, this.senders.length);
  }
  public send(this: Channel<undefined>, msg?: T): AtomicPromise<undefined>;
  public send(msg: T): AtomicPromise<undefined>;
  public send(msg: T): AtomicPromise<undefined> {
    if (!this.alive) return failure;
    switch (true) {
      case this.buffer.length < this.size:
      case this.size === 0 && this.buffer.length === 0 && this.takers.length > 0:
        this.buffer.push(msg);
        this.takers.length > 0 && this.takers.shift()!.bind();
        return success;
      default:
        return this.senders[this.senders.push(new AtomicFuture()) - 1]
          .then(() => void this.send(msg));
    }
  }
  public take(): AtomicPromise<T> {
    if (!this.alive) return failure;
    switch (true) {
      case this.buffer.length > 0:
        const msg = this.buffer.shift()!;
        this.senders.length > 0 && this.senders.shift()!.bind();
        return AtomicPromise.resolve(msg);
      case this.size === 0 && this.senders.length > 0:
        this.takers.push(new AtomicFuture());
        this.senders.shift()!.bind();
        assert(this.buffer.length === 1);
        return AtomicPromise.resolve(this.buffer.shift()!);
      default:
        return this.takers[this.takers.push(new AtomicFuture()) - 1]
          .then(() => this.take());
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
