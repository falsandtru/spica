const bases = Object.freeze([...Array(7)].map((_, i) => 1 << i));
assert.deepStrictEqual(bases, [1, 2, 4, 8, 16, 32, 64]);
const masks = Object.freeze(bases.map(radix => radix - 1));

const dict0S = [
  ...[...Array(36)].map((_, i) => i.toString(36)),
  ...[...Array(36)].map((_, i) => i.toString(36).toUpperCase()).slice(-26),
  '+', '/',
].join('');
assert(dict0S.length === 64);
const dict0_ = [
  ...[...Array(36)].map((_, i) => i.toString(36)),
  ...[...Array(36)].map((_, i) => i.toString(36).toUpperCase()).slice(-26),
  '-', '_',
].join('');
assert(dict0_.length === 64);
const dictAz = [
  ...[...Array(36)].map((_, i) => i.toString(36).toUpperCase()).slice(-26),
  ...[...Array(36)].map((_, i) => i.toString(36)).slice(-26),
].join('');
assert(dictAz.length === 52);

export const rnd10 = cons(10);
export const rnd16 = cons(16);
export const rnd32 = cons(32);
export const rnd36 = cons(36);
export const rnd62 = cons(62);
export const rnd64 = cons(64);
export const rnd09 = conv(rnd10, dict0_);
export const rnd0f = conv(rnd16, dict0_);
export const rnd0v = conv(rnd32, dict0_);
export const rnd0z = conv(rnd36, dict0_);
export const rnd0Z = conv(rnd62, dict0_);
export const rnd0S = conv(rnd64, dict0S);
export const rnd0_ = conv(rnd64, dict0_);
export const rndAP = conv(rnd16, dictAz);
export const rndAf = conv(rnd32, dictAz);

export function unique(rng: (len: number) => string, len: number = 1, mem?: Set<string>): () => string {
  const independence = !mem;
  mem ??= new Set();
  const trials = 3;
  let prefixes: Set<string>;
  let prefix = '';
  return function random(): string {
    assert(mem = mem!);
    for (let i = 0; i < trials; ++i) {
      const r = rng(len);
      if (mem.has(r)) continue;
      try {
        mem.add(r);
      }
      catch (reason) {
        // ベンチマーク程度でもSetがパンクする場合がある。
        if (!independence) throw reason;
        prefixes ??= new Set();
        prefix ||= '?';
        assert(prefix.length > 0);
        for (let i = 0; i < trials; ++i) {
          prefix = rng(prefix.length);
          if (prefixes.has(prefix)) continue;
          prefixes.add(prefix);
          mem.clear();
          return random();
        }
        prefixes = new Set();
        prefix += '?';
        return random();
      }
      return prefix + r;
    }
    ++len;
    independence && mem.clear();
    return random();
  };
}

function cons(size: number): () => number {
  const len = bases.findIndex(radix => radix >= size) as 1;
  assert(len > 0);
  return function rng(): number {
    const r = random(len);
    assert(r < bases[len]);
    return r < size
      ? r
      : rng();
  };
}

function conv($rng: () => number, dict: string): (len?: number, rng?: () => number) => string {
  return (len = 1, rng = $rng) => {
    let acc = '';
    while (len--) {
      acc += dict[rng()];
    }
    return acc;
  };
}

const buffer = new Uint16Array(512);
const digit = 16;
let index = 0;
let buf = 0;
let offset = 0;

function random(len: 1 | 2 | 3 | 4 | 5 | 6): number {
  assert(1 <= len && len <= 6);
  assert(offset < digit);
  if (offset < len) {
    if (index === 0) {
      crypto.getRandomValues(buffer);
      index = buffer.length - 1;
      buf = buffer[index];
      offset = digit;
    }
    else {
      assert(digit < 32);
      buf = buf << digit | buffer[--index];
      offset += digit;
      assert(offset < 32);
      assert(1 << offset > 0);
    }
  }
  assert(offset >= len);
  offset -= len;
  return buf >> offset & masks[len];
}

export function xorshift(seed: number = xorshift.seed()): () => number {
  assert(seed >>> 0 === seed);
  assert(seed >= 1);
  assert(seed <= ~0 >>> 0);
  return () => {
    let x = seed;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 15;
    return seed = x >>> 0;
  };
}
export namespace xorshift {
  const max = ~0 >>> 0;
  assert(max + 1 >>> 0 === 0);
  export function seed(): number {
    return Math.random() * max + 1 >>> 0;
  }
  assert(max + 1 > max);
  assert(max / (max + 1) < 1);
  export function random(seed?: number): () => number {
    const rng = xorshift(seed);
    return () => rng() / (max + 1);
  }
}

const uint32n = (n: bigint): bigint => n & 2n ** 32n - 1n;
const uint64n = (n: bigint): bigint => n & 2n ** 64n - 1n;

// https://www.pcg-random.org/download.html
// https://github.com/imneme/pcg-c/blob/master/include/pcg_variants.h
export function pcg32(seed: [bigint, bigint] = pcg32.seed()): () => number {
  return () => pcg32.next(seed);
}
export namespace pcg32 {
  type Seed = [bigint, bigint];
  const MULT = 6364136223846793005n;
  export function random(seed?: [bigint, bigint]): () => number {
    const rng = pcg32(seed);
    return () => rng() / 2 ** 32;
  }
  export function seed(
    state: bigint = BigInt(xorshift.seed()) << 32n | BigInt(xorshift.seed()),
    inc: bigint = BigInt(xorshift.seed()) << 32n | BigInt(xorshift.seed()),
  ): Seed {
    const seed: Seed = [0n, uint64n(inc << 1n | 1n)];
    seed[0] = uint64n(seed[0] * MULT + seed[1]);
    seed[0] = uint64n(seed[0] + state);
    seed[0] = uint64n(seed[0] * MULT + seed[1]);
    return seed;
  }
  export function next(seed: Seed): number {
    const oldstate = seed[0];
    seed[0] = uint64n(oldstate * MULT + seed[1]);
    const xorshifted = uint32n(((oldstate >> 18n) ^ oldstate) >> 27n);
    const rot = oldstate >> 59n;
    return Number(uint32n((xorshifted >> rot) | (xorshifted << (-rot & 31n))));
  }
  export function advance(seed: Seed, delta: bigint): Seed {
    delta = uint64n(delta);
    let acc_mult = 1n;
    let acc_plus = 0n;
    let cur_mult = MULT;
    let cur_plus = seed[1];
    while (delta > 0) {
      if (delta & 1n) {
        acc_mult = uint64n(acc_mult * cur_mult);
        acc_plus = uint64n(acc_plus * cur_mult + cur_plus);
      }
      cur_plus = uint64n((cur_mult + 1n) * cur_plus);
      cur_mult = uint64n(cur_mult * cur_mult);
      delta /= 2n;
    }
    seed[0] = uint64n(acc_mult * seed[0] + acc_plus);
    return seed;
  }
}
