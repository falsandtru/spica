// https://jasony.me/publication/sosp23-s3fifo.pdf
import { min } from './alias';
import { Queue } from './queue';

class Node<K, V> {
  constructor(
    public key: K,
    public value: V,
  ) {
  }
  public resident = true;
  public freq = 0;
}

export class S3FIFO<K, V> {
  constructor(
    private readonly capacity: number,
  ) {
    assert(capacity > 0);
  }
  private readonly capS = this.capacity * 0.1 >>> 0;
  private readonly capM = this.capacity - this.capS;
  private readonly dict = new Map<K, Node<K, V>>();
  private readonly fifoS = new Queue<Node<K, V>>();
  private readonly fifoM = new Queue<Node<K, V>>();
  private readonly fifoG = new Queue<Node<K, undefined>>();
  public get length(): number {
    return this.fifoS.length + this.fifoM.length;
  }
  public get size(): number {
    return this.fifoS.length + this.fifoM.length;
  }
  private read(x: Node<K, V>, counting = true): void {
    if (x.resident) {
      if (!counting) return;
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
    if (x.resident) {
      this.fifoS.push(x);
    }
    else {
      x.resident = true;
      this.fifoM.push(x);
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
    while (this.fifoS.length > 0) {
      const t = this.fifoS.pop()!;
      if (t.freq > 1) {
        this.fifoM.push(t);
        if (this.fifoM.length >= this.capM) {
          this.evictM();
        }
      }
      else {
        t.resident = false;
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
    while (this.fifoM.length > 0) {
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
    while (this.fifoG.length > 0) {
      const t = this.fifoG.pop()!;
      if (!t.resident) {
        this.dict.delete(t.key);
      }
      return;
    }
  }
  public set(key: K, value: V): this {
    const node = this.dict.get(key);
    if (node === undefined) {
      const node = new Node(key, value);
      this.insert(node);
      this.dict.set(key, node);
    }
    else {
      node.value = value;
      this.read(node, false);
    }
    assert(this.dict.size <= this.capacity + this.capM);
    assert(this.length <= this.capacity);
    assert(this.fifoG.length <= this.capM);
    return this;
  }
  public get(key: K): V | undefined {
    const { dict } = this;
    const node = dict.get(key);
    if (node === undefined || !node.resident) return;
    this.read(node);
    return node.value;
  }
  public has(key: K): boolean {
    return this.dict.get(key)?.resident === true;
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
