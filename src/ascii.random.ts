import { min } from './alias';

const ASCII = [...Array(256)].reduce<string>((acc, _, i) => acc + String.fromCharCode(i), '');

// 関数に変換可能
const HUFFMAN_HX_CODES = new Uint16Array(128).map((_, i) => {
  // 14|0b1110_0
  // 15|0b1110_1
  // 16|0b1111_00
  // 17|0b1111_01
  // 18|0b1111_1000_0000
  switch (true) {
    case i < 14:
      return i;
    case i < 16:
      return 0b1110 << 1 | i - 14;
    case i < 18:
      return 0b1111 << 2 | i - 16;
    default:
      return 0b1111_1 << 7 | i - 18;
  }
});
const HUFFMAN_HX_LENS = new Uint8Array(128).map((_, i) => {
  switch (true) {
    case i < 14:
      return 4;
    case i < 16:
      return 5;
    case i < 18:
      return 6;
    default:
      return 12;
  }
});
const HUFFMAN_64_CODES = new Uint16Array(128).map((_, i) => {
  // 62|0b1111_1000
  // 63|0b1111_1001
  // 64|0b1111_1010
  // 65|0b1111_1011
  // 66|0b1111_1100_000
  // 95|0b1111_1111_101
  // 96|0b1111_1111_1100_000
  switch (true) {
    case i < 62:
      return i;
    case i < 66:
      return 0b1111_10 << 2 | i - 62;
    case i < 96:
      return 0b1111_11 << 5 | i - 66;
    default:
      return 0b1111_1111_11 << 5 | i - 96;
  }
});
const HUFFMAN_64_LENS = new Uint8Array(128).map((_, i) => {
  switch (true) {
    case i < 62:
      return 6;
    case i < 66:
      return 8;
    case i < 96:
      return 11;
    default:
      return 15;
  }
});

const NUMBERS = '0123456789';
const ALPHABETS_U = 'EISAROTNLCDUPMGHYBFVKWZXJQ'.split('').reduce<string>((acc, _, i) => acc + String.fromCharCode(0x41 + i), '');
const ALPHABETS_L = 'eisarotnlcdupmghybfvkwzxjq'.split('').reduce<string>((acc, _, i) => acc + String.fromCharCode(0x61 + i), '');
const SYMBOLS_2A = '~#!?$<>\\^`|\t';
const SYMBOLS_1H = `-:% ./+=,;'"{}[]_&*@()\n`;
const SYMBOLS_1T = `+/-_= :%.,;'"{}[]&*@()\n`;
const CONTROLS = [...Array(32)].reduce<string>((acc, _, i) =>
  '\n\t'.includes(String.fromCharCode(i)) ? acc : acc + String.fromCharCode(i), '') + '\x7f';

const CHARSET_HU = `${NUMBERS}${[...ALPHABETS_U].sort().join('').slice(0, 6)}${SYMBOLS_1H}${[...ALPHABETS_U].sort().join('').slice(6)}${ALPHABETS_L}${SYMBOLS_2A}${CONTROLS}`;
const ENC_TABLE_HU = CHARSET_HU.split('')
  .reduce((table, c, i) => (table[c.charCodeAt(0)] = i, table), new Uint8Array(128));
const CHARSET_HL = `${NUMBERS}${[...ALPHABETS_L].sort().join('').slice(0, 6)}${SYMBOLS_1H}${[...ALPHABETS_L].sort().join('').slice(6)}${ALPHABETS_U}${SYMBOLS_2A}${CONTROLS}`;
const ENC_TABLE_HL = CHARSET_HL.split('')
  .reduce((table, c, i) => (table[c.charCodeAt(0)] = i, table), new Uint8Array(128));
const CHARSET_64 = `${NUMBERS}${ALPHABETS_U}${ALPHABETS_L}${SYMBOLS_1T}${SYMBOLS_2A}${CONTROLS}`;
const ENC_TABLE_64 = CHARSET_64.split('')
  .reduce((table, c, i) => (table[c.charCodeAt(0)] = i, table), new Uint8Array(128));

const MIN = 4;
type Tree = [(string | Tree)?, (string | Tree)?];
const DEC_TABLE_HU: (string | Tree)[] = [];
build(DEC_TABLE_HU, HUFFMAN_HX_CODES, HUFFMAN_HX_LENS, CHARSET_HU);
const DEC_TABLE_HL: (string | Tree)[] = [];
build(DEC_TABLE_HL, HUFFMAN_HX_CODES, HUFFMAN_HX_LENS, CHARSET_HL);
const DEC_TABLE_64: (string | Tree)[] = [];
build(DEC_TABLE_64, HUFFMAN_64_CODES, HUFFMAN_64_LENS, CHARSET_64);

function build(table: (string | Tree)[], codes: Uint16Array | Uint32Array, lens: Uint8Array, charset: string): void {
  assert(new Set(charset).size === 128 || charset.length === 256);
  for (let i = 0; i < codes.length; ++i) {
    const code = codes[i];
    let count = lens[i] - MIN;
    assert(count >= 0);
    if (count === 0) {
      table[code] = charset[i];
      continue;
    }
    let node = (table[code >> count] as Tree) ??= [];
    assert(typeof node === 'object');
    for (; count !== 0; --count) {
      const b = code & 1 << count - 1 && 1;
      if (count === 1) {
        assert(node[b] === undefined);
        node[b] = charset[i];
      }
      else {
        node = (node[b] as Tree) ??= [];
        assert(typeof node === 'object');
      }
    }
  }
}

// 乱数が改行で終端されると非常に非効率となるため=を含めず終端文字として使用することで軽減。
// 1文字足すかクオートなどで囲んで改行回避したほうがかえって効率的。
// 実際に改行で終端される場合は少ない。
const rand64 = Uint8Array.from(Array(128), (_, i) =>
  +'1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/-_'
    .includes(String.fromCharCode(i)));
const randHU = Uint8Array.from(Array(128), (_, i) =>
  +'1234567890ABCDEF-:'
    .includes(String.fromCharCode(i)));
const randHL = Uint8Array.from(Array(128), (_, i) =>
  +'1234567890abcdef-:'
    .includes(String.fromCharCode(i)));

interface Options {
  start: number;
  next: number;
  skip: number;
}

export function encode(input: string, mode = 0, opts?: Options): string {
  assert(mode === 0 || mode === 0b011 || mode === 0b101);
  const target = mode === 0
    ? rand64
    : mode === 0b011
      ? randHU
      : randHL;
  const table = mode === 0
    ? ENC_TABLE_64
    : mode === 0b011
      ? ENC_TABLE_HU
      : ENC_TABLE_HL;
  const codes: Uint16Array | Uint32Array = mode === 0
    ? HUFFMAN_64_CODES
    : HUFFMAN_HX_CODES;
  const lens = mode === 0
    ? HUFFMAN_64_LENS
    : HUFFMAN_HX_LENS;
  let output = '';
  let buffer = opts ? 1 << 7 : 0;
  let count = opts ? 1 : 0;
  for (let i = opts?.start ?? 0; i < input.length; ++i) {
    const code = input.charCodeAt(i);
    const hidx = table[code];
    const hcode = codes[hidx];
    let hlen = lens[hidx];
    while (hlen !== 0) {
      assert(count < 8);
      const cnt = min(hlen, 8 - count);
      assert(cnt > 0);
      buffer |= (hcode >>> hlen - cnt & (1 << cnt) - 1) << 8 - count - cnt;
      assert(buffer >>> 8 === 0);
      count += cnt;
      assert(count <= 8);
      hlen -= cnt;
      assert(hlen >= 0);
      if (hlen === 0 && opts && target[code] === 0) {
        opts.next = opts.start;
        opts.skip = i + 1;
        if (output.length === 0) return '';
        output += ASCII[buffer | 0xff >>> count];
        if (output.length > i + 1 - opts.start) return '';
        opts.next = i + 1;
        return output;
      }
      if (count !== 8) continue;
      output += ASCII[buffer];
      buffer = 0;
      count = 0;
    }
  }
  if (count !== 0) {
    assert(count < 8);
    output += ASCII[buffer | 0xff >>> count];
  }
  if (opts) {
    opts.next = opts.start;
    opts.skip = input.length;
    if (output.length > input.length - opts.start) return '';
    opts.next = input.length;
  }
  return output;
}

export function decode(input: string, mode = 0, opts?: Options): string {
  assert(mode === 0 || mode === 0b011 || mode === 0b101);
  const target = mode === 0
    ? rand64
    : mode === 0b011
      ? randHU
      : randHL;
  const table = mode === 0
    ? DEC_TABLE_64
    : mode === 0b011
      ? DEC_TABLE_HU
      : DEC_TABLE_HL;
  let output = '';
  let buffer = 0;
  let count = 0;
  let node: Tree[0];
  for (let i = opts?.start ?? 0; i < input.length; ++i) {
    buffer <<= 8;
    buffer |= input.charCodeAt(i);
    count += 8;
    assert(count <= 32);
    if (i === opts?.start) {
      count -= 1;
    }
    while (count !== 0) {
      if (node === undefined) {
        if (count < MIN) break;
        node = table[buffer >> count - MIN & (1 << MIN) - 1];
        if (typeof node === 'string') {
          if (opts && target[node.charCodeAt(0)] === 0) {
            output += node;
            opts.next = i + 1;
            return output;
          }
          output += node;
          node = undefined;
        }
        count -= MIN;
      }
      else {
        assert(node = node as Tree);
        const b = buffer & 1 << count - 1 && 1;
        node = node[b];
        if (typeof node === 'string') {
          if (opts && target[node.charCodeAt(0)] === 0) {
            output += node;
            opts.next = i + 1;
            return output;
          }
          output += node;
          node = undefined;
        }
        --count;
      }
    }
  }
  if (opts) {
    opts.next = input.length;
  }
  return output;
}
