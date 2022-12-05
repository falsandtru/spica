import { max, floor } from './alias';
import { List } from './list';
import { noop } from './function';

const DIGIT1 = 0;
const DIGIT2 = 8;
const DIGIT3 = 16;
const DIGIT4 = 24;
const DIGIT5 = 32;
const MASK1 = (1 << DIGIT2 - DIGIT1) - 1;
const MASK2 = (1 << DIGIT3 - DIGIT2) - 1;
const MASK3 = (1 << DIGIT4 - DIGIT3) - 1;
const MASK4 = (1 << DIGIT5 - DIGIT4) - 1;
const COUNT = Symbol('count');

type Wheels<T> = Wheel<Wheel<Wheel<Wheel<Wheel<Queue<T>>>>>>;
interface Wheel<T> {
  [index: number]: T;
  [COUNT]: number;
}
function wheel<T>(): Wheel<T> {
  const w: Wheel<T> = { [COUNT]: 0 };
  return w;
}

class Queue<T> extends List<Node<T>> {
  constructor(
    public segment: number,
    public readonly open: () => void = noop,
    public readonly close: () => void = noop,
  ) {
    super();
  }
}
class Node<T> implements List.Node {
  constructor(
    public readonly queue: Queue<T>,
    public readonly value: T,
    private readonly time: number,
  ) {
    assert([this.time]);
  }
  public next?: this = undefined;
  public prev?: this = undefined;
}

export namespace TimingWheel {
  export interface Node<T> {
    value: T;
  }
}
export class TimingWheel<T = undefined> {
  private static overflow(segment: number): number {
    return segment / 2 ** 32 >>> 0;
  }
  private static index(segment: number, digit: number, mask: number): number {
    return segment >>> digit & mask;
  }
  constructor(
    private readonly base = 0,
    private resolution = 16,
  ) {
    assert(this.earliest.segment >= 0);
  }
  private $length = 0;
  public get length(): number {
    return this.$length;
  }
  private segment(offset: number): number {
    offset = floor(max(offset / this.resolution, 0));
    return offset + 1;
  }
  private wheels: Wheels<T> = wheel();
  private earliest = new Queue<T>(0);
  private seek(): void {
    assert(this.earliest.length === 0);
    if (this.$length === 0) return;
    let segment = this.earliest.segment;
    const w5 = this.wheels;
    assert(w5[COUNT] !== 0);
    for (const i in w5) {
      const w4 = w5[i];
      if (w4[COUNT] === 0) {
        delete w5[i];
        this.earliest.segment = segment -= segment & ~0;
        continue;
      }
      for (const i in w4) {
        const w3 = w4[i];
        if (w3[COUNT] === 0) {
          delete w4[i];
          this.earliest.segment = segment -= segment & (1 << DIGIT4) - 1;
          continue;
        }
        for (const i in w3) {
          const w2 = w3[i];
          if (w2[COUNT] === 0) {
            delete w3[i];
            this.earliest.segment = segment -= segment & (1 << DIGIT3) - 1;
            continue;
          }
          for (const i in w2) {
            const w1 = w2[i];
            if (w1[COUNT] === 0) {
              delete w2[i];
              this.earliest.segment = segment -= segment & (1 << DIGIT2) - 1;
              continue;
            }
            for (const i in w1) {
              const queue = w1[i];
              if (queue.length === 0) {
                delete w1[i];
                continue;
              }
              this.earliest = queue;
              return;
            }
          }
        }
      }
    }
  }
  private queue(segment: number): Queue<T> {
    const w5 = this.wheels;
    const w4 = w5[TimingWheel.overflow(segment)] ??= wheel();
    const w3 = w4[TimingWheel.index(segment, DIGIT4, MASK4)] ??= wheel();
    const w2 = w3[TimingWheel.index(segment, DIGIT3, MASK3)] ??= wheel();
    const w1 = w2[TimingWheel.index(segment, DIGIT2, MASK2)] ??= wheel();
    const qu = w1[TimingWheel.index(segment, DIGIT1, MASK1)] ??= new Queue(
      segment,
      () => {
        assert(qu.length === 0);
        ++w1[COUNT] === 1 && ++w2[COUNT] === 1 && ++w3[COUNT] === 1 && ++w4[COUNT] === 1 && ++w5[COUNT] === 1;
      },
      () => {
        assert(qu.length === 0);
        --w1[COUNT] === 0 && --w2[COUNT] === 0 && --w3[COUNT] === 0 && --w4[COUNT] === 0 && --w5[COUNT] === 0;
        assert(w1[COUNT] >= 0);
        assert(w2[COUNT] >= 0);
        assert(w3[COUNT] >= 0);
        assert(w4[COUNT] >= 0);
        assert(w5[COUNT] >= 0);
      });
    return qu;
  }
  public peek(): TimingWheel.Node<T> | undefined {
    return this.earliest.head;
  }
  public add(time: number, value: T): TimingWheel.Node<T>;
  public add(this: TimingWheel<undefined>, time: number, value?: T): TimingWheel.Node<T>;
  public add(time: number, value: T): TimingWheel.Node<T> {
    const queue = this.queue(this.segment(time - this.base));
    if (queue.segment < this.earliest.segment || this.earliest.length === 0) {
      this.earliest = queue;
    }
    ++this.$length;
    if (queue.length === 0) {
      queue.open();
    }
    return queue.push(new Node(queue, value, time));
  }
  public delete(node: TimingWheel.Node<T>): void {
    const n = node as Node<T>;
    if (n.next === undefined) return;
    --this.$length;
    assert(this.$length >= 0);
    const queue = n.queue;
    queue.delete(n);
    if (queue.length === 0) {
      queue.close();
      queue === this.earliest && this.seek();
    }
  }
  public clear(): void {
    this.$length = 0;
    this.wheels = wheel();
    this.earliest = new Queue(0);
  }
}
