// Delta ASCII (Experimental)

/*
ASCIIコード用デルタエンコーディングアルゴリズム。
非辞書式圧縮文字エンコーディング。
定数計算量の操作のみで構成。
圧縮展開いずれも時間空間ともに線形計算量。
圧縮前よりデータサイズが増加しないことを保証。
ASCIIと完全に相互変換可能なため透過的に使用できる。

圧縮文字エンコーディングは転送または保存のために組み込み系などで使用される。
通常の圧縮アルゴリズムでは負荷が高く使用不能または肥大化する数百バイト以下の
文字列のデータサイズを平均20-30%、最大50%削減可能。
キャッシュやインメモリKVSの容量を5-10%以上拡大しRPCやIoTのトラフィックを
5-10%以上削減できる可能性がある(個別に専用のエンコーディングを適用すべき場合も多い)。
(NB-)IoTのパケットサイズは数十から数百バイト、最大512バイトのペイロード制限
がある場合もあり圧縮エンコーディングはこのレンジの文字列の圧縮に適合する。
Packed ASCIIでは8文字のタグが適用対象となっている。

*/

/*
比較検討

Delta ASCII:
ASCII互換。
最大50%圧縮。
非肥大化保証。
出現頻度の高い2文字を1byteに圧縮できるときのみ圧縮する。
文字ごとが望ましいが面倒なので簡易化。

ZSCII:
ASCII下位互換。
最大33%圧縮(1/3)？
ASCIIのサブセット(制御文字に制限)。
よくわからないが実装を見ると肥大化しそう。
セグメントIDとオフセットの組または連続のようだがこの方式はあまり
圧縮率が高くなかった。

Packed ASCII:
ASCII下位互換。
最大25%圧縮(1/4)。
ASCIIのサブセット(大文字＋数字＋記号)。

SCSU:
ASCII上位互換。
ASCII文字は圧縮されない。

HPACK:
ASCII互換。
最大37.5%圧縮。
ハフマン符号の最も優れたASCIIコード用実装と思われるが単語や数値などの
部分文字列の圧縮率はさほど効率的でないと思われる。

lz-string:
圧縮アルゴリズム。
ASCII上位互換。
圧縮率が非常に高いように見えるがUTF-16(全文字2バイト以上)としての圧縮率
であるためASCII文字やバイナリとしては肥大化しており非効率。
数百文字以上では肥大化する以上に圧縮されるが入力に準じたサイズの辞書を
生成するため入力サイズが大きければ考慮が必要。
数文字程度の短い文字列の圧縮展開でも低速なため集中的な使用には適さない。

*/

/*
v1a 同一文字が3回以上連続することはほとんどないため非効率
[0|0000000]: ASCII
[10|000000]: 7bitの反復回数
[11|000000]: 2bit-1差分x3(0b11は省略)

v1b 同上
[0|0000000]: ASCII
[10|000000]: 7bit repeat count
[11|000000]: 3bit * 2 delta

v2 近接文字が4回連続することは少ないため非効率
[0|0000000]: ASCII
[10|000000]: 2bit * 3 delta
[11|000000]: 3bit * 2 delta

v3a 効率的配置、少ない文字種、ランダム文字列に適している
[0|0000000]: ASCII
[1|0000000]: 3bit + 4bit delta (word: 0.1365; country: 0.1394)
[1|0000000]: 4bit + 3bit delta (word: 0.1420; country: 0.1405)

v3b 初期配置で非ランダム文字列に適している場合がある
[0|0000000]: ASCII
[1|0000000]: 2bit + 5bit delta (word: 0.0700; country: 0.1299)
[1|0000000]: 5bit + 2bit delta (word: 0.1060; country: 0.1034)

v4 配置中央を固定基準とする
[0|0000000]: ASCII
[1|0000000]: 4bit + 3bit delta (word: 0.2086; country: 0.2164)

v5 初期基準を設定
[0|0000000]: ASCII
[1|0000000]: 4bit + 3bit delta (word: 0.3002; country: 0.2245; text: 0.2570)

v6 セグメント遷移規則を詳細化
[0|0000000]: ASCII
[1|0000000]: 4bit + 3bit delta (word: 0.3002; country: 0.2748; text: 0.2600)
[1|0000000]: 4bit + 3bit delta (word: 0.2994; country: 0.2748; text: 0.2600)

v7 セグメント遷移規則を学習
[0|0000000]: ASCII
[1|0000000]: 4bit + 3bit delta (word: 0.2994; country: 0.2749; text: 0.2600)
[1|0000000]: 4bit + 3bit delta (num: 0.4225; hex: 0.1383; word: 0.3305; country: 0.2749; text: 0.2600)

v8 HEXモードを追加
[0|0000000]: ASCII
[1|0000000]: 4bit + 3bit delta (num: 0.4225; hex: 0.2959; word: 0.3305; country: 0.2749; text: 0.2600)

v9 区切り文字を学習
[0|0000000]: ASCII
[1|0000000]: 4bit + 3bit delta (num: 0.4225; hex: 0.2955; word: 0.3282; country: 0.3047; text: 0.3293)

*/

const ASCII = [...Array(1 << 8)].reduce<string>((acc, _, i) => acc + String.fromCharCode(i), '');
const encode$ = (char: string) => encmap[char.charCodeAt(0)];
const decode$ = (code: number) => ASCII[decmap[code]];
const decmap = new Uint8Array([
  // control -> lower
  ...[...Array(32)].map((_, i) => i),
  // upper -> upper
  ...'ZQJKXFYPAOEUIDHTNSLRCGBMWV'.split('').reverse().map(c => c.charCodeAt(0)),
  // lower -> lower
  ...'zqjkxfypaoeuidhtnslrcgbmwv'.split('').reverse().map(c => c.charCodeAt(0)),
  // number -> number
  ...'0123456789'.split('').map(c => c.charCodeAt(0)),
  // symbol -> lower
  ...` .,-/%+*!"#$&'()`.split('').map(c => c.charCodeAt(0)),
  ...[...Array(7)].map((_, i) => 0x3a + i),
  ...[...Array(6)].map((_, i) => 0x5b + i),
  ...[...Array(5)].map((_, i) => 0x7b + i),
]);
const encmap = decmap.map((_, i) => decmap.indexOf(i));
assert.deepStrictEqual([...encmap].sort(), ASCII.slice(0, 128).split('').map((_, i) => i).sort());
assert.deepStrictEqual([...decmap].sort(), ASCII.slice(0, 128).split('').map((_, i) => i).sort());
assert(ASCII.slice(0, 128).split('').every((c, i) => ASCII[decmap[encmap[i]]] === c));
const axisU = decmap.indexOf('I'.charCodeAt(0));
const axisL = decmap.indexOf('i'.charCodeAt(0));
const axisN = decmap.indexOf('0'.charCodeAt(0));
const axisH = 0;
const axisB = axisL;
const code0 = encmap['0'.charCodeAt(0)];
const codeA = encmap['V'.charCodeAt(0)];
const codea = encmap['v'.charCodeAt(0)];
const codeS = encmap[' '.charCodeAt(0)];
const enum Segment {
  Upper = 0,
  Lower = 1,
  Number = 2,
  Other = 3,
}
function segment(code: number): Segment {
  if (code < codeA) {
    return Segment.Other;
  }
  if (code < codea) {
    return Segment.Upper;
  }
  if (code < code0) {
    return Segment.Lower;
  }
  if (code < codeS) {
    return Segment.Number;
  }
  else {
    return Segment.Other;
  }
}
function align(code: number, base: number, axis: number): number {
  switch (segment(code)) {
    case Segment.Upper:
      switch (segment(base)) {
        // ABBR
        case Segment.Upper:
          hexstate = isHEX(decmap[code]);
          if (hexstate >>> 4 && axis === axisH) return axisH;
          incFreq(Segment.Upper);
          return axisU;
        // ^Case
        // CamelCase
        case Segment.Lower:
          hexstate = isHEX(decmap[code]);
          return axisL;
        // 0HDU
        case Segment.Number:
          hexstate = isHEX(decmap[code]);
          if (hexstate >>> 4) return axisH;
          return axisU;
        // _Case
        case Segment.Other:
          hexstate = isHEX(code);
          return freq >>> 2 > (freq & 0b11)
            ? axisU
            : axisL;
      }
    case Segment.Lower:
      switch (segment(base)) {
        case Segment.Upper:
          hexstate = isHEX(decmap[code]);
          incFreq(Segment.Lower);
          return axisL;
        case Segment.Lower:
          hexstate = isHEX(decmap[code]);
          if (hexstate >>> 4 && axis === axisH) return axisH;
          return axisL;
        case Segment.Number:
          hexstate = isHEX(decmap[code]);
          if (hexstate >>> 4) return axisH;
          return axisL;
        case Segment.Other:
          hexstate = isHEX(code);
          return axisL;
      }
    case Segment.Number:
      switch (segment(base)) {
        case Segment.Upper:
          hexstate = isHEX(decmap[code]);
          if (hexstate >>> 4) return axisH;
          return axisN;
        case Segment.Lower:
          hexstate = isHEX(decmap[code]);
          if (hexstate >>> 4) return axisH;
          return axisN;
        case Segment.Number:
          hexstate = isHEX(decmap[code]);
          if (hexstate >>> 4 && axis === axisH) return axisH;
          return axisN;
        case Segment.Other:
          return axisN;
      }
    case Segment.Other:
      switch (segment(base)) {
        // J.Doe
        case Segment.Upper:
          return axisU;
        // z and
        case Segment.Lower:
          return axisL;
        // 0.0
        case Segment.Number:
          return axisN;
        // , and
        case Segment.Other:
          return axisL;
      }
  }
}
function direction(code: number, axis: number): number {
  switch (axis) {
    case axisU:
    case axisL:
      if (code < codeA || code0 <= code) break;
      return code < axis ? 1 : 0;
    case axisN:
      return 1;
  }
  return 1 | 1 << 31;
}
function offset(axis: number): number {
  switch (axis) {
    case axisU:
    case axisL:
      return 0b1000;
  }
  return 0;
}
let freq = 0;
function incFreq(segment: Segment.Upper | Segment.Lower): void {
  const maskU = 0b1100;
  const maskL = 0b0011;
  if (segment === Segment.Upper) {
    if ((freq & maskU) === maskU) {
      freq = freq >>> 1 & 0b0101;
    }
    freq += 0b0100;
  }
  else {
    if ((freq & maskL) === maskL) {
      freq = freq >>> 1 & 0b0101;
    }
    freq += 0b0001;
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
function encHEX(code: number): number {
  if (code < 0x3a) return code - 0x30;
  if (code < 0x47) return code - 0x41 + 10;
  if (code < 0x67) return code - 0x61 + 10;
  throw 0;
}
function decHEX(delta: number): number {
  if (delta < 10) return encmap[0x30 + delta];
  return hexstate >>> 6 & hexstate >>> 2
    ? encmap[0x61 - 10 + delta]
    : encmap[0x41 - 10 + delta];
}
const seps = new Uint8Array(' .:-,/_\t'.split('').map(c => encmap[c.charCodeAt(0)]));
let sep = seps[0];
function encCode(code: number, axis: number): number {
  switch (axis) {
    case axisU:
    case axisL:
      if (code === axis + 7) return axis + (1 << 7);
      if (code === sep) return axis + 7;
      break;
    case axisN:
      if (code === axis + 15) return axis + (1 << 7);
      if (code === sep) return axis + 15;
      break;
  }
  sep = seps.find(sep => sep === code) ?? sep;
  return code;
}
function decDelta(delta: number, len: number, axis: number): number {
  switch (axis) {
    case axisU:
    case axisL:
      if (len === 3 && delta === 7) return sep - axis;
      if (len === 4 && delta === 15) return sep - axis + offset(axis);
      break;
    case axisN:
      if (delta === 15) return sep - axis;
      break;
  }
  const code = axis + delta;
  sep = seps.find(sep => sep === code) ?? sep;
  return delta;
}
function clear(): void {
  freq = 0;
  hexstate = 0;
  sep = seps[0];
}

export function encode(input: string): string {
  clear();
  let output = '';
  let axis = axisB;
  let base = axis;
  let buffer = 0;
  for (let i = 0, j = 0; i < input.length; ++i) {
    const code = encode$(input[i]);
    assert(code >>> 8 === 0);
    if (j === 0) {
      if (i + 1 === input.length) {
        output += ASCII[code];
        break;
      }
      const comp = axis === axisH && isHEX(decmap[code]) >>> 4 !== 0;
      const delta = comp
        ? encHEX(decmap[code])
        : encCode(code, axis) - axis + offset(axis);
      if (delta >>> 4 || axis === axisH && !comp) {
        output += ASCII[code];
      }
      else {
        buffer = delta << 3;
        ++j;
      }
    }
    else {
      const sep$ = sep;
      const dir = direction(base, axis);
      const comp = axis === axisH && isHEX(decmap[code]) >>> 4 !== 0;
      const delta = comp
        ? encHEX(decmap[code])
        : dir & 1
          ? encCode(code, axis) - axis
          : axis - code - 1;
      if (delta >>> 3 || axis === axisH && !comp ||
          dir >>> 31 === 0 &&
          (axis === axisU || axis === axisL) &&
          base < axis === code < axis) {
        if (!comp && dir & 1) {
          sep = sep$;
        }
        output += ASCII[base];
        buffer = 0;
        i -= j;
        j = 0;
        continue;
      }
      else {
        buffer |= delta;
        output += ASCII[0b1 << 7 | buffer];
      }
      buffer = 0;
      j = 0;
    }
    axis = align(code, base, axis);
    base = code;
  }
  assert(buffer === 0);
  assert(output.length <= input.length);
  return output;
}

export function decode(input: string): string {
  clear();
  let output = '';
  let axis = axisB;
  let base = axis;
  for (let i = 0; i < input.length; ++i) {
    let code = input[i].charCodeAt(0);
    if (code <= 0x7f) {
      output += decode$(code);
      sep = seps.find(sep => sep === code) ?? sep;
      axis = align(code, base, axis);
      base = code;
    }
    else {
      const delta = code;
      code = axis == axisH
        ? decHEX(delta >>> 3 & 0b1111)
        : axis + decDelta(delta >>> 3 & 0b1111, 4, axis) - offset(axis);
      output += decode$(code);
      axis = align(code, base, axis);
      base = code;
      const dir = direction(base, axis);
      code = axis == axisH
        ? decHEX(delta & 0b111)
        : dir & 1
          ? axis + decDelta(delta & 0b0111, 3, axis)
          : axis - (delta & 0b0111) - 1;
      output += decode$(code);
      axis = align(code, base, axis);
      base = code;
    }
  }
  return output;
}
