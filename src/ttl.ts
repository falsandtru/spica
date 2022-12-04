import { max, floor } from './alias';
import { List } from './list';
import { now } from './chrono';

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
  private static digit4(seg: number): number {
    assert(seg === seg >>> 0);
    return seg >>> DIGIT4 & MASK;
  }
  private static digit3(seg: number): number {
    assert(seg === seg >>> 0);
    return seg >>> DIGIT3 & MASK;
  }
  private static digit2(seg: number): number {
    assert(seg === seg >>> 0);
    return seg >>> DIGIT2 & MASK;
  }
  private static digit1(seg: number): number {
    assert(seg === seg >>> 0);
    return seg & MASK;
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
  private get digit4(): number {
    return this.earliest.segment >>> DIGIT4 & MASK;
  }
  private get digit3(): number {
    return this.earliest.segment >>> DIGIT3 & MASK;
  }
  private get digit2(): number {
    return this.earliest.segment >>> DIGIT2 & MASK;
  }
  private get digit1(): number {
    return this.earliest.segment & MASK;
  }
  private seek(): void {
    assert(this.earliest.length === 0);
    let cont = true;
    let d5 = this.overflow;
    for (; d5 < this.wheel.length; ++d5) {
      const l4 = this.wheel[d5];
      if (l4 === undefined) continue;
      let d4 = cont ? this.digit4 : 0;
      for (; d4 < l4.length; ++d4) {
        const l3 = l4[d4];
        if (l3 === undefined) continue;
        let d3 = cont ? this.digit3 : 0;
        for (; d3 < l3.length; ++d3) {
          const l2 = l3[d3];
          if (l2 === undefined) continue;
          let d2 = cont ? this.digit2 : 0;
          for (; d2 < l2.length; ++d2) {
            const l1 = l2[d2];
            if (l1 === undefined) continue;
            let d1 = cont ? this.digit1 : 0;
            for (; d1 < l1.length; ++d1) {
              const queue = l1[d1];
              if (queue === undefined) continue;
              if (queue.length === 0) continue;
              this.earliest = queue;
              return;
            }
            cont = false;
            d1 = 0;
            assert(l2[d2]?.every(q => !q?.length) ?? true);
            l2[d2] = undefined as any;
          }
          d2 = 0;
          assert(l3[d3]?.every(q => !q?.length) ?? true);
          l3[d3] = undefined as any;
        }
        d3 = 0;
        assert(l4[d4]?.every(q => !q?.length) ?? true);
        l4[d4] = undefined as any;
      }
      d4 = 0;
      assert(this.wheel[d5]?.every(q => !q?.length) ?? true);
      this.wheel[d5] = undefined as any;
    }
    this.earliest = this.queue(this.segment(now() - this.base));
  }
  private queue(seg: number): Queue<T> {
    const l4 = this.wheel[TTL.overflow(seg)] ??= [];
    const l3 = l4[TTL.digit4(seg)] ??= [];
    const l2 = l3[TTL.digit3(seg)] ??= [];
    const l1 = l2[TTL.digit2(seg)] ??= [];
    const qu = l1[TTL.digit1(seg)] ??= new Queue(seg);
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
