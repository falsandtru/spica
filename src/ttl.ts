import { max, floor } from './alias';
import { List } from './list';
import { now } from './chrono';
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
const INIT = 16;
assert(INIT <= Math.min(MASK1, MASK2, MASK3, MASK4) + 1);

type Wheels<T> = Wheel<Wheel<Wheel<Wheel<Wheel<Queue<T>>>>>>;
interface Wheel<T> {
  [index: number]: T;
  [COUNT]: number;
  readonly length: number;
}
function wheel<T>(): Wheel<T> {
  const w: Wheel<T> = Array(INIT) as any;
  w[COUNT] = 0;
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
    private readonly expiration: number,
  ) {
    assert([this.expiration]);
  }
  public next?: this = undefined;
  public prev?: this = undefined;
}

export namespace TTL {
  export interface Node<T> {
    value: T;
  }
}
export class TTL<T = undefined> {
  private static overflow(segment: number): number {
    return segment / 2 ** 32 >>> 0;
  }
  private static index(segment: number, digit: number, mask: number): number {
    return segment >>> digit & mask;
  }
  constructor(
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
  private readonly base = now();
  private wheels: Wheels<T> = wheel();
  private earliest = new Queue<T>(0);
  private seek(): void {
    assert(this.earliest.length === 0);
    if (this.$length === 0) return;
    const segment = this.earliest.segment;
    let cont = true;
    const w5 = this.wheels;
    assert(w5[COUNT] !== 0);
    let i5 = TTL.overflow(segment);
    for (; i5 < w5.length; ++i5) {
      if (!(i5 in w5)) continue;
      const w4 = w5[i5];
      if (w4 === undefined) continue;
      if (w4[COUNT] === 0) continue;
      let i4 = cont ? TTL.index(segment, DIGIT4, MASK4) : 0;
      for (; i4 < w4.length; ++i4) {
        if (!(i4 in w4)) continue;
        const w3 = w4[i4];
        if (w3 === undefined) continue;
        if (w3[COUNT] === 0) continue;
        let i3 = cont ? TTL.index(segment, DIGIT3, MASK3) : 0;
        for (; i3 < w3.length; ++i3) {
          if (!(i3 in w3)) continue;
          const w2 = w3[i3];
          if (w2 === undefined) continue;
          if (w2[COUNT] === 0) continue;
          let i2 = cont ? TTL.index(segment, DIGIT2, MASK2) : 0;
          for (; i2 < w2.length; ++i2) {
            if (!(i2 in w2)) continue;
            const w1 = w2[i2];
            if (w1 === undefined) continue;
            if (w1[COUNT] === 0) continue;
            let i1 = cont ? TTL.index(segment, DIGIT1, MASK1) : 0;
            for (; i1 < w1.length; ++i1) {
              if (!(i1 in w1)) continue;
              const queue = w1[i1];
              if (queue === undefined) continue;
              if (queue.length === 0) continue;
              this.earliest = queue;
              return;
            }
            cont = false;
          }
          cont = false;
        }
        cont = false;
      }
      cont = false;
    }
  }
  private queue(segment: number): Queue<T> {
    const w5 = this.wheels;
    const w4 = w5[TTL.overflow(segment)] ??= wheel();
    const w3 = w4[TTL.index(segment, DIGIT4, MASK4)] ??= wheel();
    const w2 = w3[TTL.index(segment, DIGIT3, MASK3)] ??= wheel();
    const w1 = w2[TTL.index(segment, DIGIT2, MASK2)] ??= wheel();
    const qu = w1[TTL.index(segment, DIGIT1, MASK1)] ??= new Queue(
      segment,
      () => {
        assert(qu.length === 0);
        ++w1[COUNT] === 1 && ++w2[COUNT] === 1 && ++w3[COUNT] === 1 && ++w4[COUNT] === 1 && ++w5[COUNT] === 1;
        assert(w1[COUNT] >= 0);
        assert(w2[COUNT] >= 0);
        assert(w3[COUNT] >= 0);
        assert(w4[COUNT] >= 0);
        assert(w5[COUNT] >= 0);
      },
      () => {
        assert(qu.length === 0);
        --w1[COUNT] === 0 && --w2[COUNT] === 0 && --w3[COUNT] === 0 && --w4[COUNT] === 0 && --w5[COUNT] === 0;
        assert(w1[COUNT] >= 0);
        assert(w2[COUNT] >= 0);
        assert(w3[COUNT] >= 0);
        assert(w4[COUNT] >= 0);
        assert(w5[COUNT] >= 0);
        assert(this.earliest.segment === segment || this.earliest !== qu);
        if (w4[COUNT] === 0) {
          assert(qu.length === 0);
          if (qu === this.earliest) {
            this.earliest.segment -= segment & ~0;
          }
          return w5[TTL.overflow(segment)] = undefined as any;
        }
        if (w3[COUNT] === 0) {
          assert(qu.length === 0);
          if (qu === this.earliest) {
            this.earliest.segment -= segment & (1 << DIGIT4) - 1;
          }
          return w4[TTL.index(segment, DIGIT4, MASK4)] = undefined as any;
        }
        if (w2[COUNT] === 0) {
          assert(qu.length === 0);
          if (qu === this.earliest) {
            this.earliest.segment -= segment & (1 << DIGIT3) - 1;
          }
          return w3[TTL.index(segment, DIGIT3, MASK3)] = undefined as any;
        }
        if (w1[COUNT] === 0) {
          assert(qu.length === 0);
          if (qu === this.earliest) {
            this.earliest.segment -= segment & (1 << DIGIT2) - 1;
          }
          return w2[TTL.index(segment, DIGIT2, MASK2)] = undefined as any;
        }
        //if (qu.length === 0) return w1[TTL.index(segment, DIGIT1, MASK1)] = undefined as any;
      });
    return qu;
  }
  public peek(): TTL.Node<T> | undefined {
    return this.earliest.head;
  }
  public add(expiration: number, value: T): TTL.Node<T>;
  public add(this: TTL<undefined>, expiration: number, value?: T): TTL.Node<T>;
  public add(expiration: number, value: T): TTL.Node<T> {
    const queue = this.queue(this.segment(expiration - this.base));
    if (queue.segment < this.earliest.segment || this.earliest.length === 0) {
      this.earliest = queue;
    }
    ++this.$length;
    if (queue.length === 0) {
      queue.open();
    }
    return queue.push(new Node(queue, value, expiration));
  }
  public delete(node: TTL.Node<T>): void {
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
