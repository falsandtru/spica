import { ceil, log2 } from './alias';
import { IterableDict } from './dict';

const BASE = 32;
const DIGIT = log2(BASE);
assert(DIGIT === 5);
const MASK = BASE - 1;
assert((BASE & MASK) === 0);

export class Clock<K, V = undefined> implements IterableDict<K, V> {
  constructor(
    private readonly capacity: number,
  ) {
    this.capacity = BASE * ceil(capacity / BASE);
    this.refs = new Uint32Array(this.capacity >>> DIGIT);
  }
  private dict = new Map<K, number>();
  private keys: (K | undefined)[] = [];
  private values: (V | undefined)[] = [];
  private refs: Uint32Array;
  private hand = 0;
  private $length = 0;
  public get length(): number {
    return this.$length;
  }
  public get size(): number {
    return this.$length;
  }
  private mark(index: number): void {
    this.refs[index >>> DIGIT] |= 1 << (index & MASK);
  }
  private unmark(index: number): void {
    this.refs[index >>> DIGIT] &= ~(1 << (index & MASK));
  }
  private locate(hand: number, key: K, value: V): void {
    this.$length === this.capacity
      ? this.dict.delete(this.keys[hand]!)
      : ++this.$length;
    assert(!this.dict.has(key));
    this.dict.set(key, hand);
    assert(this.dict.size <= this.capacity);
    assert(this.$length === this.dict.size);
    this.keys[hand] = key;
    this.values[hand] = value;
    this.hand = ++hand === this.capacity
      ? 0
      : hand;
  }
  public add(key: K, value: V): number {
    const { capacity, refs } = this;
    let hand = this.hand;
    for (let i = hand >>> DIGIT, r = hand & MASK, len = refs.length; ;) {
      assert(r < BASE);
      const b = refs[i];
      assert(~0 === 2 ** BASE - 1 >> 0);
      if (b >>> r === ~0 >>> r) {
        hand += BASE - r;
        refs[i] = 0;
        r = 0;
        if (++i === len) {
          i = 0;
        }
        continue;
      }
      const l = search(b, r);
      assert(l < BASE);
      assert((b & 1 << l) === 0);
      refs[i] = b & ~((1 << l) - 1 >>> r << r);
      hand = (hand + l - r) % capacity;
      this.locate(hand, key, value);
      return hand;
    }
  }
  public put(key: K, value: V): number {
    const index = this.dict.get(key);
    if (index === undefined) return this.add(key, value);
    this.mark(index);
    this.values[index] = value;
    return index;
  }
  public set(key: K, value: V): this {
    this.put(key, value);
    return this;
  }
  public get(key: K): V | undefined {
    const index = this.dict.get(key);
    if (index === undefined) return;
    this.mark(index);
    return this.values[index];
  }
  public has(key: K): boolean {
    return this.dict.has(key);
  }
  public delete(key: K): boolean {
    const index = this.dict.get(key);
    if (index === undefined) return false;
    this.dict.delete(key);
    this.keys[index] = undefined;
    this.values[index] = undefined;
    this.unmark(index);
    --this.$length;
    assert(this.$length === this.dict.size);
    return true;
  }
  public clear(): void {
    this.dict = new Map();
    this.keys = [];
    this.values = [];
    this.refs = new Uint32Array(this.refs.length);
    this.hand = 0;
    this.$length = 0;
  }
  public *[Symbol.iterator](): Iterator<[K, V], undefined, undefined> {
    const { keys, values } = this;
    for (const index of this.dict.values()) {
      yield [keys[index]!, values[index]!];
    }
    return;
  }
}

function search(b: number, r: number): number {
  assert(b !== ~0);
  for (let l = r; ; ++l) {
    if ((b & 1 << l) === 0) return l;
  }
}
function bsearch(b: number, r: number): number {
  const n = ~b >>> r << r >>> 0;
  const l = potision(0x05f66a47 * (n & -n) >>> 27);
  assert(l === search(b, r));
  return l;
}
//const potisions = new Uint8Array([
//  0, 1, 2, 26, 23, 3, 15, 27, 24, 21, 19, 4, 12, 16, 28, 6, 31, 25, 22, 14, 20, 18, 11, 5, 30, 13, 17, 10, 29, 9, 8, 7,
//]);
function potision(n: number): number {
  switch (n) {
    case 0: return 0;
    case 1: return 1;
    case 2: return 2;
    case 3: return 26;
    case 4: return 23;
    case 5: return 3;
    case 6: return 15;
    case 7: return 27;
    case 8: return 24;
    case 9: return 21;
    case 10: return 19;
    case 11: return 4;
    case 12: return 12;
    case 13: return 16;
    case 14: return 28;
    case 15: return 6;
    case 16: return 31;
    case 17: return 25;
    case 18: return 22;
    case 19: return 14;
    case 20: return 20;
    case 21: return 18;
    case 22: return 11;
    case 23: return 5;
    case 24: return 30;
    case 25: return 13;
    case 26: return 17;
    case 27: return 10;
    case 28: return 29;
    case 29: return 9;
    case 30: return 8;
    default: return 7;
  }
}
assert(bsearch(0b0, 0) === 0);
assert(bsearch(0b1, 0) === 1);
assert(bsearch(0b10, 0) === 0);
assert(bsearch(0b11, 0) === 2);
assert(bsearch(0b00, 1) === 1);
assert(bsearch(0b01, 1) === 1);
assert(bsearch(0b10, 1) === 2);
assert(bsearch(0b11, 1) === 2);
assert(bsearch(0b110, 1) === 3);
assert(bsearch(0b111, 1) === 3);
assert(bsearch(~0 >>> 1, 0) === 31);
assert(bsearch(~0 >>> 2, 0) === 30);
assert(bsearch(~0 >>> 1, 31) === 31);
assert(bsearch(~0 >>> 2, 31) === 31);
assert(bsearch(~0 >>> 1, 30) === 31);
assert(bsearch(~0 >>> 2, 30) === 30);
