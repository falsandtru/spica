import { ceil, log2 } from './alias';
import { IterableDict } from './dict';

const BASE = 32;
const DIGIT = log2(BASE);
assert(DIGIT === 5);
const MASK = BASE - 1;
assert((BASE & MASK) === 0);

type empty = typeof empty;
const empty = Symbol('empty');

export class Clock<K, V> implements IterableDict<K, V> {
  // Capacity is rounded up to multiples of 32.
  constructor(
    private readonly capacity: number,
  ) {
    this.capacity = BASE * ceil(capacity / BASE);
    this.refs = new Uint32Array(this.capacity >>> DIGIT);
  }
  private dict = new Map<K, number>();
  private keys: (K | undefined)[] = [];
  private values: (V | undefined | empty)[] = [];
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
  private initial: 1 | 0 = 1;
  private locate(hand: number, key: K, value: V): void {
    const { capacity, dict, keys, values } = this;
    this.$length === capacity || this.initial === 0 && values[hand] !== empty
      ? dict.delete(keys[hand]!)
      : ++this.$length;
    assert(!this.dict.has(key));
    dict.set(key, hand);
    assert(this.dict.size <= this.capacity);
    assert(this.$length === this.dict.size);
    keys[hand] = key;
    values[hand] = value;
    this.hand = ++hand === capacity
      ? this.initial = 0
      : hand;
  }
  public add(key: K, value: V): number {
    const { capacity, refs } = this;
    for (let hand = this.hand, i = hand >>> DIGIT, r = hand & MASK; ;) {
      assert(hand < capacity);
      assert(r < BASE);
      const b = refs[i];
      assert(~0 === 2 ** BASE - 1 >> 0);
      if (b >>> r === ~0 >>> r) {
        hand = hand + BASE - r;
        refs[i] = 0;
        r = 0;
        if (hand < capacity) {
          ++i;
        }
        else {
          hand -= capacity;
          i = 0;
        }
        continue;
      }
      const l = search(b, r);
      assert(l < BASE);
      assert((b & 1 << l) === 0);
      refs[i] = b & ~((1 << l) - 1 >>> r << r);
      hand += l - r;
      assert(hand < capacity);
      this.locate(hand, key, value);
      return hand;
    }
  }
  public put(key: K, value: V): number {
    const index = this.dict.get(key);
    if (index === undefined) return this.add(key, value);
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
    return this.values[index] as V;
  }
  public has(key: K): boolean {
    return this.dict.has(key);
  }
  public delete(key: K): boolean {
    const index = this.dict.get(key);
    if (index === undefined) return false;
    // 末尾と削除対象を交換して削除する。
    // 次の挿入の前に次の削除が行われると交換できないが稀なため対処しない。
    const { hand, dict, keys, values, refs } = this;
    dict.delete(key);
    --this.$length;
    assert(this.$length === this.dict.size);
    const k = keys[index] = keys[hand];
    const v = values[index] = values[hand];
    keys[hand] = undefined;
    values[hand] = empty;
    if (index === hand || v === empty) {
      this.unmark(index);
      return true;
    }
    assert(this.dict.has(k!));
    dict.set(k!, index);
    (refs[hand >>> DIGIT] & 1 << (hand & MASK)) === 0
      ? this.unmark(index)
      : this.mark(index);
    this.unmark(hand);
    return true;
  }
  public clear(): void {
    this.dict = new Map();
    this.keys = [];
    this.values = [];
    this.refs.fill(0);
    this.hand = 0;
    this.$length = 0;
  }
  public *[Symbol.iterator](): Iterator<[K, V], undefined, undefined> {
    const { keys, values } = this;
    for (const index of this.dict.values()) {
      yield [keys[index]!, values[index]! as V];
    }
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
