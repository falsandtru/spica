import { max, floor } from './alias';
import { List } from './list';
import { now } from './chrono';

const DIGIT1 = 0;
const DIGIT2 = 32 / 4;
assert(DIGIT2 === 8);
const DIGIT3 = DIGIT2 * 2;
const DIGIT4 = DIGIT2 * 3;
const OVERFLOW = (~0 >>> 0) + 1;
const MASK = (1 << DIGIT2) - 1;

type Wheel<T> = Queue<T>[/* D1 */][/* D2 */][/* D3 */][/* D4 */][/* OF */];

class Queue<T> extends List<Node<T>> {
  constructor(public readonly segment: number) {
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
  private static overflow(seg: number): number {
    assert(seg === seg >>> 0);
    return seg / OVERFLOW >>> 0;
  }
  private static index(seg: number, digit: number): number {
    assert(seg === seg >>> 0);
    return seg >>> digit & MASK;
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
    if (offset !== offset >>> 0) throw new Error('Spica: TTL: Too large offset time');
    return offset + 1;
  }
  private readonly base = now();
  private wheel: Wheel<T> = [];
  private earliest = new Queue<T>(0);
  private get overflow(): number {
    return this.earliest.segment / OVERFLOW >>> 0;
  }
  private index(digit: number): number {
    return this.earliest.segment >>> digit & MASK;
  }
  private seek(): void {
    assert(this.earliest.length === 0);
    let cont = true;
    let i5 = this.overflow;
    for (; i5 < this.wheel.length; ++i5) {
      const l4 = this.wheel[i5];
      if (l4 === undefined) continue;
      let i4 = cont ? this.index(DIGIT4) : 0;
      for (; i4 < l4.length; ++i4) {
        const l3 = l4[i4];
        if (l3 === undefined) continue;
        let i3 = cont ? this.index(DIGIT3) : 0;
        for (; i3 < l3.length; ++i3) {
          const l2 = l3[i3];
          if (l2 === undefined) continue;
          let i2 = cont ? this.index(DIGIT2) : 0;
          for (; i2 < l2.length; ++i2) {
            const l1 = l2[i2];
            if (l1 === undefined) continue;
            let i1 = cont ? this.index(DIGIT1) : 0;
            for (; i1 < l1.length; ++i1) {
              const queue = l1[i1];
              if (queue === undefined) continue;
              if (queue.length === 0) continue;
              this.earliest = queue;
              return;
            }
            cont = false;
            i1 = 0;
            assert(l2[i2]?.every(q => !q?.length) ?? true);
            l2[i2] = undefined as any;
          }
          i2 = 0;
          assert(l3[i3]?.every(q => !q?.length) ?? true);
          l3[i3] = undefined as any;
        }
        i3 = 0;
        assert(l4[i4]?.every(q => !q?.length) ?? true);
        l4[i4] = undefined as any;
      }
      i4 = 0;
      assert(this.wheel[i5]?.every(q => !q?.length) ?? true);
      this.wheel[i5] = undefined as any;
    }
  }
  private queue(seg: number): Queue<T> {
    const l5 = this.wheel;
    const l4 = l5[TTL.overflow(seg)] ??= [];
    const l3 = l4[TTL.index(seg, DIGIT4)] ??= [];
    const l2 = l3[TTL.index(seg, DIGIT3)] ??= [];
    const l1 = l2[TTL.index(seg, DIGIT2)] ??= [];
    const qu = l1[TTL.index(seg, DIGIT1)] ??= new Queue(seg);
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
    return queue.push(new Node(queue, value));
  }
  public delete(node: TTL.Node<T>): void {
    const n = node as Node<T>;
    if (n.next === undefined) return;
    const queue = n.queue;
    queue.delete(n);
    --this.$length;
    if (queue === this.earliest && queue.length === 0) {
      this.seek();
    }
  }
  public clear(): void {
    this.$length = 0;
    this.wheel = [];
    this.earliest = new Queue(0);
  }
}
