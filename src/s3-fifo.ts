// https://jasony.me/publication/sosp23-s3fifo.pdf
import { min } from './alias';
import { Queue } from './queue';

class Node<K, V> {
  constructor(
    public key: K,
    public value: V,
  ) {
  }
  public part: 'S' | 'M' | 'G' = 'S';
  public freq = 0;
}

export class S3FIFO<K, V> {
  constructor(
    private capacity: number,
  ) {
    this.capS = capacity * 0.1 >>> 0 || 1;
    this.capM = capacity - this.capS;
    this.fifoS = new Queue();
    this.fifoM = new Queue();
    this.fifoG = new Queue();
  }
  private readonly dict = new Map<K, Node<K, V>>();
  private readonly capS: number;
  private readonly capM: number;
  private readonly fifoS: Queue<Node<K, V>>;
  private readonly fifoM: Queue<Node<K, V>>;
  private readonly fifoG: Queue<Node<K, undefined>>;
  public get length(): number {
    return this.fifoS.length + this.fifoM.length;
  }
  public get size(): number {
    return this.fifoS.length + this.fifoM.length;
  }
  private read(x: Node<K, V>) {
    if (x.part !== 'G') {
      x.freq = min(x.freq + 1, 3);
    }
    else {
      this.insert(x);
      x.freq = 0;
    }
  }
  private insert(x: Node<K, V>): void {
    if (this.length === this.capacity) {
      this.evict();
    }
    if (x.part === 'G') {
      x.part = 'M';
      this.fifoM.push(x);
    }
    else {
      assert(x.part === 'S');
      this.fifoS.push(x);
    }
  }
  private evict(): void {
    if (this.fifoS.length >= this.capS) {
      this.evictS();
    }
    else {
      this.evictM();
    }
  }
  private evictS(): void {
    while (!this.fifoS.isEmpty()) {
      const t = this.fifoS.pop()!;
      if (t.freq > 1) {
        t.part = 'M';
        this.fifoM.push(t);
        if (this.fifoM.length >= this.capM) {
          this.evictM();
        }
      }
      else {
        t.part = 'G';
        // @ts-expect-error
        t.value = undefined;
        if (this.fifoG.length >= this.capM) {
          this.evictG();
        }
        this.fifoG.push(t as Node<K, undefined>);
        return;
      }
    }
  }
  private evictM(): void {
    while (!this.fifoM.isEmpty()) {
      const t = this.fifoM.pop()!;
      if (t.freq > 0) {
        this.fifoM.push(t);
        t.freq = t.freq - 1;
      }
      else {
        this.dict.delete(t.key);
        return;
      }
    }
  }
  private evictG(): void {
    while (!this.fifoG.isEmpty()) {
      const t = this.fifoG.pop()!;
      this.dict.delete(t.key);
      return;
    }
  }
  public add(key: K, value: V): boolean {
    const node = new Node(key, value);
    this.insert(node);
    this.dict.set(key, node);
    assert(this.dict.size <= this.capacity + this.capM);
    assert(this.length <= this.capacity);
    assert(this.fifoG.length <= this.capM);
    return true;
  }
  public set(key: K, value: V): this {
    const node = this.dict.get(key);
    if (node === undefined) {
      this.add(key, value);
    }
    else {
      node.value = value;
      this.read(node);
    }
    assert(this.dict.size <= this.capacity + this.capM);
    assert(this.length <= this.capacity);
    assert(this.fifoG.length <= this.capM);
    return this;
  }
  public get(key: K): V | undefined {
    const { dict } = this;
    const node = dict.get(key);
    if (node === undefined || node.part === 'G') return;
    this.read(node);
    return node.value;
  }
  public has(key: K): boolean {
    switch (this.dict.get(key)?.part) {
      case 'S':
      case 'M':
        return true;
      default:
        return false;
    }
  }
  public clear(): void {
    this.dict.clear();
    this.fifoS.clear();
    this.fifoM.clear();
    this.fifoG.clear();
  }
  public *[Symbol.iterator](): Iterator<[K, V], undefined, undefined> {
    for (const fifo of [this.fifoS, this.fifoM]) {
      for (const { key, value } of fifo) {
        yield [key, value];
      }
    }
  }
}
