import { max, floor } from './alias';
import { List } from './list';
import { now } from './chrono';
import { noop } from './function';

const DIGIT1 = 0;
const DIGIT2 = 32 / 4;
assert(DIGIT2 === 8);
const DIGIT3 = DIGIT2 * 2;
const DIGIT4 = DIGIT2 * 3;
const MASK = (1 << DIGIT2) - 1;
const COUNT = Symbol('count');

type Wheels<T> = Wheel<Wheel<Wheel<Wheel<Wheel<Queue<T>>>>>>;
interface Wheel<T> {
  [index: number]: T;
  [COUNT]: number;
  readonly length: number;
}
function wheel<T>(): Wheel<T> {
  const w: Wheel<T> = [] as any;
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
  ) {
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
  private static index(segment: number, digit: number): number {
    return segment >>> digit & MASK;
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
    const segment = this.earliest.segment;
    let cont = true;
    const l5 = this.wheels;
    if (l5[COUNT] === 0) return;
    let i5 = TTL.overflow(segment);
    for (; i5 < l5.length; ++i5) {
      const l4 = l5[i5];
      if (l4 === undefined) continue;
      if (l4[COUNT] === 0) continue;
      let i4 = cont ? TTL.index(segment, DIGIT4) : 0;
      for (; i4 < l4.length; ++i4) {
        const l3 = l4[i4];
        if (l3 === undefined) continue;
        if (l3[COUNT] === 0) continue;
        let i3 = cont ? TTL.index(segment, DIGIT3) : 0;
        for (; i3 < l3.length; ++i3) {
          const l2 = l3[i3];
          if (l2 === undefined) continue;
          if (l2[COUNT] === 0) continue;
          let i2 = cont ? TTL.index(segment, DIGIT2) : 0;
          for (; i2 < l2.length; ++i2) {
            const l1 = l2[i2];
            if (l1 === undefined) continue;
            if (l1[COUNT] === 0) continue;
            let i1 = cont ? TTL.index(segment, DIGIT1) : 0;
            for (; i1 < l1.length; ++i1) {
              const queue = l1[i1];
              if (queue === undefined) continue;
              if (queue.length === 0) continue;
              this.earliest = queue;
              return;
            }
            cont = false;
          }
        }
      }
    }
  }
  private queue(segment: number): Queue<T> {
    const l5 = this.wheels;
    const l4 = l5[TTL.overflow(segment)] ??= wheel();
    const l3 = l4[TTL.index(segment, DIGIT4)] ??= wheel();
    const l2 = l3[TTL.index(segment, DIGIT3)] ??= wheel();
    const l1 = l2[TTL.index(segment, DIGIT2)] ??= wheel();
    const qu = l1[TTL.index(segment, DIGIT1)] ??= new Queue(
      segment,
      () => {
        assert(qu.length === 0);
        ++l1[COUNT] === 1 && ++l2[COUNT] === 1 && ++l3[COUNT] === 1 && ++l4[COUNT] === 1 && ++l5[COUNT] === 1;
        assert(l1[COUNT] >= 0);
        assert(l2[COUNT] >= 0);
        assert(l3[COUNT] >= 0);
        assert(l4[COUNT] >= 0);
        assert(l5[COUNT] >= 0);
      },
      () => {
        assert(qu.length === 0);
        --l1[COUNT] === 0 && --l2[COUNT] === 0 && --l3[COUNT] === 0 && --l4[COUNT] === 0 && --l5[COUNT] === 0;
        assert(l1[COUNT] >= 0);
        assert(l2[COUNT] >= 0);
        assert(l3[COUNT] >= 0);
        assert(l4[COUNT] >= 0);
        assert(l5[COUNT] >= 0);
        assert(this.earliest.segment === segment || this.earliest !== qu);
        if (l4[COUNT] === 0) {
          assert(qu.length === 0);
          if (qu === this.earliest) {
            this.earliest.segment -= segment & ~0;
          }
          return l5[TTL.overflow(segment)] = undefined as any;
        }
        if (l3[COUNT] === 0) {
          assert(qu.length === 0);
          if (qu === this.earliest) {
            this.earliest.segment -= segment & (1 << DIGIT4) - 1;
          }
          return l4[TTL.index(segment, DIGIT4)] = undefined as any;
        }
        if (l2[COUNT] === 0) {
          assert(qu.length === 0);
          if (qu === this.earliest) {
            this.earliest.segment -= segment & (1 << DIGIT3) - 1;
          }
          return l3[TTL.index(segment, DIGIT3)] = undefined as any;
        }
        if (l1[COUNT] === 0) {
          assert(qu.length === 0);
          if (qu === this.earliest) {
            this.earliest.segment -= segment & (1 << DIGIT2) - 1;
          }
          return l2[TTL.index(segment, DIGIT2)] = undefined as any;
        }
        //if (qu.length === 0) return l1[TTL.index(segment, DIGIT1)] = undefined as any;
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
    const node = queue.push(new Node(queue, value));
    return node;
  }
  public delete(node: TTL.Node<T>): void {
    const n = node as Node<T>;
    if (n.next === undefined) return;
    const queue = n.queue;
    queue.delete(n);
    --this.$length;
    if (queue.length === 0) {
      queue.close();
      if (queue === this.earliest) {
        this.seek();
      }
    }
  }
  public clear(): void {
    this.$length = 0;
    this.wheels = wheel();
    this.earliest = new Queue(0);
  }
}
