import { Object, crypto } from './global';
import { ObjectCreate } from './alias';

const bases = [0, 2, 4, 8, 16, 32, 64] as const;
const dict = [
  ...[...Array(36)].map((_, i) => i.toString(36)),
  ...[...Array(26)].map((_, i) => (i + 10).toString(36).toUpperCase()),
];
assert(dict.length === 62);
assert(dict[dict.length - 1] === 'Z');

export const rnd16 = cons(16);
export const rnd32 = cons(32);
export const rnd36 = cons(36);
export const rnd62 = cons(62);
export const rnd0f = conv(rnd16);
export const rnd0z = conv(rnd36);
export const rnd0Z = conv(rnd62);

export function unique(rnd: (len: number) => string, len: number, mem: object = ObjectCreate(null)): () => string {
  if (mem instanceof Object) throw new Error('Spica: unique: Memory object must inherit null.');
  assert(mem = mem as object);
  let limit = 5;
  return () => {
    while (true) {
      for (let i = 0; i < limit; ++i) {
        const r = rnd(len);
        if (r in mem) continue;
        mem[r] = 1;
        return r;
      }
      ++len;
      limit = len < 3 ? limit : 3;
    }
  };
}

function cons(radix: number): () => number {
  const base = bases.find(base => base >= radix) ?? bases[bases.length - 1];
  const len = bases.indexOf(base) as 1;
  return () => {
    while (true) {
      const r = random(len)
      assert(r < base);
      if (r < radix) return r;
    }
  };
}

function conv(rnd: () => number): (len?: number) => string {
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
  }
  if (offset < len) {
    offset = digit;
    ++index;
    return random(len);
  }
  if (offset > len) {
    offset -= len;
    return buffer[index] >> offset & masks[len];
  }
  else {
    offset = digit;
    return buffer[index++] & masks[len];
  }
}
