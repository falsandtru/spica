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

export function unique(rnd: (len: number) => string, len: number): () => string {
  let mem = new Set<string>();
  let retry = 5;
  let prefixes: Set<string>;
  let prefix = '';
  return function random(): string {
    assert(mem = mem!);
    for (let i = 0; i < retry; ++i) {
      const r = rnd(len);
      if (mem.has(r)) continue;
      try {
        mem.add(r);
      }
      catch (reason) {
        // ベンチマーク程度でもSetがパンクする場合がある。
        prefixes ??= new Set();
        for (let i = 0; i < 2; ++i) {
          prefix = rnd(prefix.length + (i + 1) / 2 | 0 || 1);
          if (prefixes.has(prefix)) continue;
          prefixes.add(prefix);
          mem = new Set();
          break;
        }
        if (mem.size !== 0) throw reason;
        return random();
      }
      return prefix + r;
    }
    mem = new Set();
    ++len;
    retry = len < 3
      ? retry
      : len < 5
        ? 3
        : 2;
    return random();
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
