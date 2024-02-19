import { Heap } from './heap';
import { memoize } from './memoize';
import { IterableDict } from './dict';

const size = 2048;
const initsize = 16;

export class Queue<T> {
  constructor(
    private readonly permanent: boolean = false,
  ) {
  }
  private head = new FixedQueue<T>(initsize);
  private tail = this.head;
  private count = 0;
  private irregular = 0;
  public get length(): number {
    return this.count === 0
      ? this.head.length
      : this.head.length + this.tail.length + (size - 1) * (this.count - 2) + (this.irregular || size) - 1;
  }
  // Faster than queue.length > 0.
  public isEmpty(): boolean {
    return this.head.isEmpty();
  }
  public peek(index: 0 | -1 = 0): T | undefined {
    return index === 0
      ? this.head.peek(0)
      : this.tail.peek(-1);
  }
  public push(value: T): void {
    const tail = this.tail;
    if (tail.isFull()) {
      if (tail.next.isEmpty()) {
        this.tail = tail.next;
      }
      else if (!this.permanent) {
        this.tail = tail.next = new FixedQueue(size);
        assert(this.tail.next !== this.head);
      }
      else {
        this.tail = tail.next = new FixedQueue(size, tail.next);
      }
      assert(this.tail.isEmpty());
      ++this.count;
      if (tail.size !== size && tail !== this.head) {
        this.irregular = tail.size;
        assert(this.irregular === initsize);
      }
    }
    this.tail.push(value);
  }
  public pop(): T | undefined {
    const head = this.head;
    const value = head.pop();
    if (head.isEmpty() && !head.next.isEmpty()) {
      this.head = head.next;
      if (!this.permanent) {
        head.next = head;
      }
      --this.count;
      if (this.head.size === this.irregular) {
        assert(this.irregular === initsize);
        this.irregular = 0;
      }
    }
    return value;
  }
  public clear(): void {
    this.head = this.tail = new FixedQueue(initsize);
    this.count = 0;
    this.irregular = 0;
  }
  public *[Symbol.iterator](): Iterator<T, undefined, undefined> {
    while (!this.isEmpty()) {
      yield this.pop()!;
    }
  }
}

// capacity = size - 1
class FixedQueue<T> {
  constructor(
    public readonly size: number,
    next?: FixedQueue<T>,
  ) {
    assert((this.array.length & this.array.length - 1) === 0);
    this.next = next ?? this;
  }
  private readonly array = Array<T | undefined>(this.size);
  private readonly mask = this.array.length - 1;
  private head = 0;
  private tail = 0;
  public next: FixedQueue<T>;
  public get length(): number {
    return this.tail >= this.head
      ? this.tail - this.head
      : this.array.length - this.head + this.tail;
  }
  public isEmpty(): boolean {
    return this.tail === this.head;
  }
  public isFull(): boolean {
    return (this.tail + 1 & this.mask) === this.head;
  }
  public peek(index: 0 | -1 = 0): T | undefined {
    return index === 0
      ? this.array[this.head]
      : this.array[this.tail - 1 & this.mask];
  }
  public push(value: T): void {
    this.array[this.tail] = value;
    this.tail = this.tail + 1 & this.mask;
  }
  public pop(): T | undefined {
    if (this.isEmpty()) return;
    const value = this.array[this.head];
    this.array[this.head] = undefined;
    this.head = this.head + 1 & this.mask;
    return value;
  }
}

export class PriorityQueue<T, P = T> {
  private static readonly priority = Symbol('priority');
  public static readonly max = Heap.max;
  public static readonly min = Heap.min;
  constructor(
    cmp: (a: P, b: P) => number = PriorityQueue.max,
    private clean = true,
  ) {
    this.heap = new Heap(cmp);
  }
  private readonly heap: Heap<Queue<T>, P>;
  private readonly dict = new Map<P, Queue<T>>();
  private readonly queue = memoize<P, Queue<T>>(priority => {
    const queue = new Queue<T>();
    queue[PriorityQueue.priority] = priority;
    this.heap.insert(queue, priority);
    return queue;
  }, this.dict);
  private $length = 0;
  public get length(): number {
    return this.$length;
  }
  public isEmpty(): boolean {
    return this.$length === 0;
  }
  public peek(priority?: P): T | undefined {
    return arguments.length === 0
      ? this.heap.peek()?.value.peek()
      : this.dict.get(priority!)?.peek();
  }
  public push(priority: P, value: T): void {
    ++this.$length;
    this.queue(priority).push(value);
  }
  public pop(priority?: P): T | undefined {
    if (this.$length === 0) return;
    --this.$length;
    const queue = arguments.length === 0
      ? this.heap.peek()!.value
      : this.dict.get(priority!);
    const value = queue?.pop();
    if (queue?.isEmpty()) {
      this.heap.extract();
      this.clean && this.dict.delete(queue[PriorityQueue.priority]);
    }
    return value;
  }
  public clear(): void {
    this.heap.clear();
    this.dict.clear();
    this.$length = 0;
  }
  public *[Symbol.iterator](): Iterator<T, undefined, undefined> {
    while (!this.isEmpty()) {
      yield this.pop()!;
    }
  }
}

export class MultiQueue<K, V> implements IterableDict<K, V> {
  constructor(
    entries?: Iterable<readonly [K, V]>,
  ) {
    if (entries) for (const { 0: k, 1: v } of entries) {
      this.set(k, v);
    }
  }
  private dict = new Map<K, Queue<V>>();
  public get length(): number {
    return this.dict.size;
  }
  public isEmpty(): boolean {
    return this.dict.size === 0;
  }
  public peek(key: K): V | undefined {
    return this.dict.get(key)?.peek();
  }
  public push(key: K, value: V): void {
    let vs = this.dict.get(key);
    if (vs) return void vs.push(value);
    vs = new Queue();
    vs.push(value);
    this.dict.set(key, vs);
  }
  public pop(key: K): V | undefined {
    return this.dict.get(key)?.pop();
  }
  public clear(): void {
    this.dict = new Map();
  }
  public take(key: K): V | undefined;
  public take(key: K, count: number): V[];
  public take(key: K, count?: number): V | undefined | V[] {
    if (count === undefined) return this.pop(key);
    const vs = this.dict.get(key);
    const acc: V[] = [];
    while (vs && !vs.isEmpty() && count--) {
      acc.push(vs.pop()!);
    }
    return acc;
  }
  public ref(key: K): Queue<V> {
    let vs = this.dict.get(key);
    if (vs) return vs;
    vs = new Queue();
    this.dict.set(key, vs);
    return vs;
  }
  public get size(): number {
    return this.length;
  }
  public get(key: K): V | undefined {
    return this.peek(key);
  }
  public set(key: K, value: V): this {
    this.push(key, value);
    return this;
  }
  public has(key: K): boolean {
    return this.dict.has(key);
  }
  public delete(key: K): boolean {
    return this.dict.delete(key);
  }
  public *[Symbol.iterator](): Iterator<[K, V], undefined, undefined> {
    for (const { 0: k, 1: vs } of this.dict) {
      while (!vs.isEmpty()) {
        yield [k, vs.pop()!];
      }
    }
  }
}
