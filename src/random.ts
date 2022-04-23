import { Set, crypto } from './global';

const bases = [...Array(7)].map((_, i) => 1 << i);
assert.deepStrictEqual(bases, [1, 2, 4, 8, 16, 32, 64]);
const dict0_ = [
  ...[...Array(36)].map((_, i) => i.toString(36)),
  ...[...Array(36)].map((_, i) => i.toString(36).toUpperCase()).slice(-26),
  '-', '_',
];
assert(dict0_.length === 64);
// eslint-disable-next-line
assert(dict0_.join('').match(/^0.*9a.*zA.*Z-_$/));
const dictAz = [
  ...[...Array(36)].map((_, i) => i.toString(36).toUpperCase()).slice(-26),
  ...[...Array(36)].map((_, i) => i.toString(36)).slice(-26),
];
assert(dictAz.length === 52);
// eslint-disable-next-line
assert(dictAz.join('').match(/^A.*Za.*z$/));

export const rnd16 = cons(16);
export const rnd32 = cons(32);
export const rnd62 = cons(62);
export const rnd64 = cons(64);
export const rnd0f = conv(rnd16, dict0_);
export const rnd0v = conv(rnd32, dict0_);
export const rnd0Z = conv(rnd62, dict0_);
export const rnd0_ = conv(rnd64, dict0_);
export const rndAP = conv(rnd16, dictAz);
export const rndAf = conv(rnd32, dictAz);

export function unique(rnd: (len: number) => string, len: number, mem?: Set<string>): () => string {
  const clear = !mem;
  mem ??= new Set();
  let limit = 5;
  return () => {
    while (true) {
      for (let i = 0; i < limit; ++i) {
        const r = rnd(len);
        if (mem!.has(r)) continue;
        mem!.add(r);
        return r;
      }
      clear && mem!.clear();
      ++len;
      limit = len < 3 ? limit : 3;
    }
  };
}

function cons(radix: number): () => number {
  const base = bases.find(base => base >= radix)!;
  assert(base);
  const len = bases.indexOf(base) as 1;
  return () => {
    while (true) {
      const r = random(len)
      assert(r < base);
      if (r < radix) return r;
    }
  };
}

function conv(rnd: () => number, dict: string[]): (len?: number) => string {
  return (len = 1) => {
    let acc = '';
    while (len--) {
      acc += dict[rnd()];
    }
    return acc;
  };
}

const buffer = new Uint16Array(512);
const digit = 16;
const masks = bases.map((_, i) => +`0b${'1'.repeat(i) || 0}`);
let index = buffer.length;
let offset = digit;

function random(len: 1 | 2 | 3 | 4 | 5 | 6): number {
  assert(0 < len && len <= 6);
  if (index === buffer.length) {
    crypto.getRandomValues(buffer);
    index = 0;
    assert(offset === digit);
  }
  if (offset === len) {
    assert(offset === len);
    offset = digit;
    return buffer[index++] & masks[len];
  }
  else if (offset > len) {
    assert(offset > len);
    offset -= len;
    return buffer[index] >> offset & masks[len];
  }
  else {
    assert(offset < len);
    offset = digit;
    ++index;
    return random(len);
  }
}
