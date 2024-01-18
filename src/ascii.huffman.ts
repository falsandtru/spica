import { min } from './alias';

// Contextual Huffman ASCII (Experimental)

/*
圧縮率は高いがフットプリントが非常に大きい。
削減は不可能ではないが非常に煩雑で現実的ではない。

*/

const ASCII = [...Array(256)].reduce<string>((acc, _, i) => acc + String.fromCharCode(i), '');

const HUFFMAN_NN_CODES = new Uint16Array(128).map((_, i) =>
  i < 14 ? i : 0b111 << 7 | i - 14);
const HUFFMAN_NN_LENS = new Uint8Array(128).map((_, i) =>
  i < 14 ? 4 : 10);
const HUFFMAN_AU_CODES = new Uint16Array(128).map((_, i) => {
  // 60|0b1111_00
  // 61|0b1111_01
  // 62|0b1111_1000_000
  // 63|0b1111_1000_001
  //124|0b1111_1111_1100
  //125|0b1111_1111_1101
  //126|0b1111_1111_1110
  //127|0b1111_1111_1111
  switch (true) {
    case i < 62:
      return i;
    case i < 124:
      return 0b1111_1 << 6 | i - 62;
    default:
      return 0b1111_1111_11 << 2 | i - 124;
  }
});
const HUFFMAN_AU_LENS = new Uint8Array(128).map((_, i) => {
  switch (true) {
    case i < 62:
      return 6;
    case i < 124:
      return 11;
    default:
      return 12;
  }
});
const HUFFMAN_AL_CODES = new Uint16Array(128).map((_, i) =>
  i < 30 ? i : 0b1111 << 7 | i - 30);
const HUFFMAN_AL_LENS = new Uint8Array(128).map((_, i) =>
  i < 30 ? 5 : 11);
const HUFFMAN_HX_CODES = new Uint16Array(128).map((_, i) => {
  // 14|0b1110_0
  // 15|0b1110_1
  // 16|0b1111_00
  // 17|0b1111_01
  // 18|0b1111_10
  // 19|0b1111_1100_0000_0
  switch (true) {
    case i < 14:
      return i;
    case i < 16:
      return 0b1110 << 1 | i - 14;
    case i < 19:
      return 0b1111 << 2 | i - 16;
    default:
      return 0b1111_11 << 7 | i - 19;
  }
});
const HUFFMAN_HX_LENS = new Uint8Array(128).map((_, i) => {
  switch (true) {
    case i < 14:
      return 4;
    case i < 16:
      return 5;
    case i < 19:
      return 6;
    default:
      return 13;
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
const SYMBOLS_1A = ` .:-'",;%/+={}[]_&*@()\n`;
const SYMBOLS_2A = '~#!?$<>\\^`|\t';
const SYMBOLS_1N = ` .:-%/+=,;'"{}[]_&*@()\n`;
const SYMBOLS_1H = `:%- ./+=,;'"{}[]_&*@()\n`;
const SYMBOLS_1T = `+/-_= :%.,;'"{}[]&*@()\n`;
const CONTROLS = [...Array(32)].reduce<string>((acc, _, i) =>
  '\n\t'.includes(String.fromCharCode(i)) ? acc : acc + String.fromCharCode(i), '') + '\x7f';

const CHARSET_NN = `${NUMBERS}${SYMBOLS_1N}${ALPHABETS_L}${ALPHABETS_U}${SYMBOLS_2A}${CONTROLS}`;
const ENC_TABLE_NN = CHARSET_NN.split('')
  .reduce((table, c, i) => (table[c.charCodeAt(0)] = i, table), new Uint8Array(128));
const CHARSET_AU = `${ALPHABETS_U}${ALPHABETS_L}${SYMBOLS_1A}${NUMBERS}${SYMBOLS_2A}${CONTROLS}`;
const ENC_TABLE_AU = CHARSET_AU.split('')
  .reduce((table, c, i) => (table[c.charCodeAt(0)] = i, table), new Uint8Array(128));
const CHARSET_AL = `${ALPHABETS_L}${SYMBOLS_1A}${ALPHABETS_U}${NUMBERS}${SYMBOLS_2A}${CONTROLS}`;
const ENC_TABLE_AL = CHARSET_AL.split('')
  .reduce((table, c, i) => (table[c.charCodeAt(0)] = i, table), new Uint8Array(128));
const CHARSET_AS = `${SYMBOLS_1A}${SYMBOLS_2A}${ALPHABETS_L}${ALPHABETS_U}${NUMBERS}${CONTROLS}`;
const ENC_TABLE_AS = CHARSET_AS.split('')
  .reduce((table, c, i) => (table[c.charCodeAt(0)] = i, table), new Uint8Array(128));
const CHARSET_HU = `${NUMBERS}${[...ALPHABETS_U].sort().join('')}${SYMBOLS_1H}${ALPHABETS_L}${SYMBOLS_2A}${CONTROLS}`;
const ENC_TABLE_HU = CHARSET_HU.split('')
  .reduce((table, c, i) => (table[c.charCodeAt(0)] = i, table), new Uint8Array(128));
const CHARSET_HL = `${NUMBERS}${[...ALPHABETS_L].sort().join('')}${SYMBOLS_1H}${ALPHABETS_U}${SYMBOLS_2A}${CONTROLS}`;
const ENC_TABLE_HL = CHARSET_HL.split('')
  .reduce((table, c, i) => (table[c.charCodeAt(0)] = i, table), new Uint8Array(128));
const CHARSET_64 = `${NUMBERS}${ALPHABETS_U}${ALPHABETS_L}${SYMBOLS_1T}${SYMBOLS_2A}${CONTROLS}`;
const ENC_TABLE_64 = CHARSET_64.split('')
  .reduce((table, c, i) => (table[c.charCodeAt(0)] = i, table), new Uint8Array(128));

const MIN = 4;
type Tree = [(string | Tree)?, (string | Tree)?];
const DEC_TABLE_NN: (string | Tree)[] = [];
build(DEC_TABLE_NN, HUFFMAN_NN_CODES, HUFFMAN_NN_LENS, CHARSET_NN);
const DEC_TABLE_AU: (string | Tree)[] = [];
build(DEC_TABLE_AU, HUFFMAN_AU_CODES, HUFFMAN_AU_LENS, CHARSET_AU);
const DEC_TABLE_AL: (string | Tree)[] = [];
build(DEC_TABLE_AL, HUFFMAN_AL_CODES, HUFFMAN_AL_LENS, CHARSET_AL);
const DEC_TABLE_SS: (string | Tree)[] = [];
build(DEC_TABLE_SS, HUFFMAN_AU_CODES, HUFFMAN_AU_LENS, CHARSET_AS);
const DEC_TABLE_HU: (string | Tree)[] = [];
build(DEC_TABLE_HU, HUFFMAN_HX_CODES, HUFFMAN_HX_LENS, CHARSET_HU);
const DEC_TABLE_HL: (string | Tree)[] = [];
build(DEC_TABLE_HL, HUFFMAN_HX_CODES, HUFFMAN_HX_LENS, CHARSET_HL);
const DEC_TABLE_64: (string | Tree)[] = [];
build(DEC_TABLE_64, HUFFMAN_64_CODES, HUFFMAN_64_LENS, CHARSET_64);

function build(table: (string | Tree)[], codes: Uint16Array, lens: Uint8Array, charset: string): void {
  assert(new Set(charset).size === 128);
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

const enum Segment {
  Upper = 0,
  Lower = 1,
  Number = 2,
  Other = 3,
}
function segment(code: number): Segment {
  if (code < 0x61) {
    if (code < 0x3a) {
      if (code < 0x30) return Segment.Other;
      return Segment.Number;
    }
    if (code < 0x5b) {
      if (code < 0x41) return Segment.Other;
      return Segment.Upper;
    }
    return Segment.Other;
  }
  else {
    if (code < 0x7b) return Segment.Lower;
    return Segment.Other;
  }
}
function alignEnc(code: number, base: number, table: Uint8Array): Uint8Array {
  switch (segment(code)) {
    case Segment.Upper:
      if (table === ENC_TABLE_64) return table;
      switch (segment(base)) {
        case Segment.Upper:
          hexstate = isHEX(code);
          if (hexstate >>> 4 && table === ENC_TABLE_HU) return table;
          return ENC_TABLE_AU;
        case Segment.Lower:
          hexstate = isHEX(code);
          return ENC_TABLE_AL;
        case Segment.Number:
          hexstate = isHEX(code);
          if (hexstate >>> 4) return ENC_TABLE_HU;
          return ENC_TABLE_64;
        case Segment.Other:
          hexstate = isHEX(code);
          if (hexstate >>> 4) return ENC_TABLE_HU;
          return ENC_TABLE_AU;
      }
    case Segment.Lower:
      if (table === ENC_TABLE_64) return table;
      switch (segment(base)) {
        case Segment.Upper:
          hexstate = isHEX(code);
          return ENC_TABLE_AL;
        case Segment.Lower:
          hexstate = isHEX(code);
          if (hexstate >>> 4 && table === ENC_TABLE_HL) return table;
          return ENC_TABLE_AL;
        case Segment.Number:
          hexstate = isHEX(code);
          if (hexstate >>> 4) return ENC_TABLE_HL;
          return ENC_TABLE_64;
        case Segment.Other:
          hexstate = isHEX(code);
          if (hexstate >>> 4) return ENC_TABLE_HL;
          return ENC_TABLE_AL;
      }
    case Segment.Number:
      if (table === ENC_TABLE_64) return table;
      switch (segment(base)) {
        case Segment.Upper:
          hexstate = isHEX(code);
          if (hexstate >>> 4) return ENC_TABLE_HU;
          return ENC_TABLE_NN;
        case Segment.Lower:
          hexstate = isHEX(code);
          if (hexstate >>> 4) return ENC_TABLE_HL;
          return ENC_TABLE_NN;
        case Segment.Number:
          if (hexstate >>> 4 && table === ENC_TABLE_HU) return table;
          if (hexstate >>> 4 && table === ENC_TABLE_HL) return table;
          return ENC_TABLE_NN;
        case Segment.Other:
          hexstate = isHEX(code);
          if ((hexstate >>> 4 & hexstate) === 0b011) return ENC_TABLE_HU;
          if ((hexstate >>> 4 & hexstate) === 0b101) return ENC_TABLE_HL;
          return ENC_TABLE_NN;
      }
    case Segment.Other:
      hexstate = hexstate >>> 4 !== 0 && (code === 0x2d || code === 0x3a) ? hexstate : 0;
      if (table === ENC_TABLE_64 && isContinuous(code)) return table;
      switch (segment(base)) {
        case Segment.Upper:
          if (hexstate >>> 4) return table;
          return ENC_TABLE_AU;
        case Segment.Lower:
          if (hexstate >>> 4) return table;
          return ENC_TABLE_AL;
        case Segment.Number:
          if ((hexstate >>> 4 & hexstate) === 0b011) return ENC_TABLE_HU;
          if ((hexstate >>> 4 & hexstate) === 0b101) return ENC_TABLE_HL;
          return ENC_TABLE_NN;
        case Segment.Other:
          return ENC_TABLE_AS;
      }
  }
}
function alignDec(code: number, base: number, table: typeof DEC_TABLE_NN): typeof DEC_TABLE_NN {
  switch (segment(code)) {
    case Segment.Upper:
      if (table === DEC_TABLE_64) return table;
      switch (segment(base)) {
        // ABBR
        case Segment.Upper:
          hexstate = isHEX(code);
          if (hexstate >>> 4 && table === DEC_TABLE_HU) return table;
          return DEC_TABLE_AU;
        // CamelCase
        case Segment.Lower:
          hexstate = isHEX(code);
          return DEC_TABLE_AL;
        // 0HDU
        case Segment.Number:
          hexstate = isHEX(code);
          if (hexstate >>> 4) return DEC_TABLE_HU;
          return DEC_TABLE_64;
        // ^Case
        // _Case
        case Segment.Other:
          hexstate = isHEX(code);
          if (hexstate >>> 4) return DEC_TABLE_HU;
          return DEC_TABLE_AU;
      }
    case Segment.Lower:
      if (table === DEC_TABLE_64) return table;
      switch (segment(base)) {
        case Segment.Upper:
          hexstate = isHEX(code);
          return DEC_TABLE_AL;
        case Segment.Lower:
          hexstate = isHEX(code);
          if (hexstate >>> 4 && table === DEC_TABLE_HL) return table;
          return DEC_TABLE_AL;
        case Segment.Number:
          hexstate = isHEX(code);
          if (hexstate >>> 4) return DEC_TABLE_HL;
          return DEC_TABLE_64;
        case Segment.Other:
          hexstate = isHEX(code);
          if (hexstate >>> 4) return DEC_TABLE_HL;
          return DEC_TABLE_AL;
      }
    case Segment.Number:
      if (table === DEC_TABLE_64) return table;
      switch (segment(base)) {
        case Segment.Upper:
          hexstate = isHEX(code);
          if (hexstate >>> 4) return DEC_TABLE_HU;
          return DEC_TABLE_NN;
        case Segment.Lower:
          hexstate = isHEX(code);
          if (hexstate >>> 4) return DEC_TABLE_HL;
          return DEC_TABLE_NN;
        case Segment.Number:
          if (hexstate >>> 4 && table === DEC_TABLE_HU) return table;
          if (hexstate >>> 4 && table === DEC_TABLE_HL) return table;
          return DEC_TABLE_NN;
        case Segment.Other:
          hexstate = isHEX(code);
          if ((hexstate >>> 4 & hexstate) === 0b011) return DEC_TABLE_HU;
          if ((hexstate >>> 4 & hexstate) === 0b101) return DEC_TABLE_HL;
          return DEC_TABLE_NN;
      }
    case Segment.Other:
      hexstate = hexstate >>> 4 !== 0 && (code === 0x2d || code === 0x3a) ? hexstate : 0;
      if (table === DEC_TABLE_64 && isContinuous(code)) return table;
      switch (segment(base)) {
        // J.Doe
        case Segment.Upper:
          if (hexstate >>> 4) return table;
          return DEC_TABLE_AU;
        // z and
        case Segment.Lower:
          if (hexstate >>> 4) return table;
          return DEC_TABLE_AL;
        // 0.0
        case Segment.Number:
          if ((hexstate >>> 4 & hexstate) === 0b011) return DEC_TABLE_HU;
          if ((hexstate >>> 4 & hexstate) === 0b101) return DEC_TABLE_HL;
          return DEC_TABLE_NN;
        // , and
        case Segment.Other:
          return DEC_TABLE_SS;
      }
  }
}
let hexstate = 0;
function isHEX(code: number): number {
  assert(hexstate >>> 8 === 0);
  if (code < 0x30) return 0;
  if (code < 0x3a) {
    return hexstate & 0xf0
      ? hexstate & hexstate << 4 | 0b111
      : hexstate << 4 & 0xff | 0b111;
  }
  if (code < 0x41) return 0;
  if (code < 0x47) {
    return hexstate & 0xf0
      ? (hexstate >>> 4 & hexstate) === 0b011 ? hexstate & hexstate << 4 | 0b011 : 0b011
      : hexstate << 4 & 0xff | 0b011;
  }
  if (code < 0x61) return 0;
  if (code < 0x67) {
    return hexstate & 0xf0
      ? (hexstate >>> 4 & hexstate) === 0b101 ? hexstate & hexstate << 4 | 0b101 : 0b101
      : hexstate << 4 & 0xff | 0b101;
  }
  return 0;
}
function isContinuous(code: number): boolean {
  switch (code) {
    case 0x2b:
    case 0x2d:
    case 0x2f:
    case 0x5f:
      return true;
    default:
      return false;
  }
}
function clear(): void {
  hexstate = 0;
}

export function encode(input: string, stats?: { length: number; }): string {
  clear();
  stats && (stats.length = 0);
  let output = '';
  let table = ENC_TABLE_AL;
  let codes = HUFFMAN_AL_CODES;
  let lens = HUFFMAN_AL_LENS;
  let base = 0x20;
  let buffer = 0;
  let count = 0;
  for (let i = 0; i < input.length; ++i) {
    const code = input.charCodeAt(i);
    const hidx = table[code];
    const hcode = codes[hidx];
    let hlen = lens[hidx];
    table = alignEnc(code, base, table);
    switch (table) {
      case ENC_TABLE_NN:
        codes = HUFFMAN_NN_CODES;
        lens = HUFFMAN_NN_LENS;
        break;
      case ENC_TABLE_AU:
        codes = HUFFMAN_AU_CODES;
        lens = HUFFMAN_AU_LENS;
        break;
      case ENC_TABLE_AL:
        codes = HUFFMAN_AL_CODES;
        lens = HUFFMAN_AL_LENS;
        break;
      case ENC_TABLE_HU:
      case ENC_TABLE_HL:
        codes = HUFFMAN_HX_CODES;
        lens = HUFFMAN_HX_LENS;
        break;
      case ENC_TABLE_64:
        codes = HUFFMAN_64_CODES;
        lens = HUFFMAN_64_LENS;
        break;
      default:
        codes = HUFFMAN_AU_CODES;
        lens = HUFFMAN_AU_LENS;
    }
    base = code;
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
      if (count !== 8) continue;
      output += ASCII[buffer];
      stats && (stats.length += count);
      buffer = 0;
      count = 0;
    }
  }
  if (count !== 0) {
    assert(count < 8);
    output += ASCII[buffer | 0xff >>> count];
    stats && (stats.length += count);
  }
  return output;
}

export function decode(input: string): string {
  clear();
  let output = '';
  let table = DEC_TABLE_AL;
  let base = 0x20;
  let buffer = 0;
  let count = 0;
  let node: Tree[0];
  for (let i = 0; i < input.length; ++i) {
    buffer <<= 8;
    buffer |= input.charCodeAt(i);
    count += 8;
    assert(count <= 32);
    while (count !== 0) {
      if (node === undefined) {
        if (count < MIN) break;
        node = table[buffer >> count - MIN & (1 << MIN) - 1];
        if (typeof node === 'string') {
          const code = node.charCodeAt(0);
          table = alignDec(code, base, table);
          base = code;
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
          const code = node.charCodeAt(0);
          table = alignDec(code, base, table);
          base = code;
          output += node;
          node = undefined;
        }
        --count;
      }
    }
  }
  return output;
}
