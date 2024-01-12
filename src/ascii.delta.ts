import { encode as encodePercent, decode as decodePercent } from './ascii.percent';
import { encode as encodeToken, decode as decodeToken } from './ascii.token';

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
SQL ServerではSCSUが使われている。
Protobufではsintが使われている。

理論的観点から見ると汎用的な静的テーブルを使用するハフマン符号はランダム文字列も
圧縮できるほど全体的かつ平均的に圧縮率を高めたことで反面最も圧縮頻度の高い単語、
数値、識別子(HEX)などの部分的な圧縮率が低下していると考えられる(万能を追求しすぎて
器用貧乏化した。そのうえ肥大化リスクもあるので逆に汎用エンコーディングとしては
バランスが悪く使いにくいものとなった。ハフマン符号は個別の符号化では最適に近くとも
個別の偏りの情報を持たない汎用的な非個別的符号化では個別の偏りに動的に適応する
アルゴリズムより圧縮率が低くなりうることは自明である。DAは次の部分文字列と文字の
2つの頻度情報を持つがハフマン符号は一般的かつ全体的な頻度情報しか持たないため
基本的に部分文字列の規則性が高いほどDAに有利となる)。
これは文字レベルの最適化と文字列レベルの最適化の違いと考えられハフマン符号は
文字レベルの圧縮エンコーディング、DAは文字列レベルの圧縮エンコーディングと言える。
圧縮率の比較結果は規則性の高い部分文字列の多い文字列の圧縮には文字列レベルの
エンコーディングの方が文字レベルのエンコーディングより適していることを示している。
DAが最終的に単語や数値等の部分文字列の多い文字列においてもハフマン符号の圧縮率を
超えられなかったとしても部分文字列によってはランレングスや独自符号などハフマン符号より
優れた圧縮方式が存在することから部分文字列ごとに最適な圧縮方式を適用し全体として複数の
圧縮方式を組み合わせる複合方式の圧縮率がハフマン符号より高くなりうることは自明である。
DAはこれを可能にする効率的な合成方法を開発したものでもある。
複合方式は少なくとも大文字小文字の各文字列両方の圧縮において非常に短い文字列を除いて
ハフマン符号より理論的に優れていることを容易に証明できる。すべての大文字小文字に
5ビットの符号を割り当てることは単一の符号表しか持たないハフマン符号では不可能だが
複数の符号表を複合できる複合方式では容易である。符号表が2つあれば符号表自体が
1ビットの情報となるため符号のビット数を平均1ビット削減できる。この差は文字数に比例して
拡大することはあっても縮小することはない。従ってこの場合に単一の静的テーブルを使用する
ハフマン符号より複合方式の方が効率的で圧縮率が高いことが理論的に証明される。程度の差は
あれど識別可能なすべての規則的文字列に同じことが当てはまり理想的なハフマン符号であっても
この理論的非効率性を免れることはない。これはハフマン符号に限らず算術符号や範囲符号に
おいても同じである。なお文字列内での符号表の変更はヘッダや文字数などのオーバーヘッドなし
で可能である。

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
ASCII文字はUTF-8からは圧縮されない。

HPACK:
ASCII互換。
最大37.5%圧縮。
ハフマン符号の最も優れたASCIIコード用実装と思われるが単語や数値などの
部分文字列の圧縮率はさほど効率的でないと思われる。

ANS/FSE:
おそらくDAのような状態遷移を高度化し算術符号または範囲符号を使用するものだが
有望ではあるが理論的に主張されるほど最適でも汎用的でもなさそう。
そもそも理論的に最適に近くとも頻度分布が正しいことが前提なので単語やBase64など
事前知識により部分ごとに最適な符号表を使用するほど効率的ではないと思われる。
そしてANS/FSEはそれに適したアルゴリズムではないように見える。
エンコーディングとしては状態の初期化コストも無視できないものとなる懸念がある。
https://arxiv.org/abs/1311.2540
https://github.com/Cyan4973/FiniteStateEntropy
https://www.reddit.com/r/programming/comments/7uoqic/finite_state_entropy_made_easy/?rdt=38141

lz-string:
圧縮アルゴリズム。
ASCII上位互換。
圧縮率が非常に高いように見えるがUTF-16(全文字2バイト以上)としての圧縮率
であるためASCIIやバイナリとしては肥大化しており非効率。
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

v10 頻度基準に変更
[0|0000000]: ASCII
[1|0000000]: 4bit + 3bit delta (num: 0.4225; hex: 0.3032; word: 0.3193; country: 0.3052; text: 0.3232)

v11 開始文字を設定
[0|0000000]: ASCII
[1|0000000]: 4bit + 3bit delta (num: 0.4225; hex: 0.3038; word: 0.3239; country: 0.3058; text: 0.3544)

*/

const ASCII = [...Array(256)].reduce<string>((acc, _, i) => acc + String.fromCharCode(i), '');
const tablesN = [
  new Uint8Array(128).fill(~0),
  ...Array(2).fill(new Uint8Array('0123456789 .:-,/'.split('').map(c => c.charCodeAt(0)))) as [Uint8Array, Uint8Array],
] as const;
tablesN.forEach((table, i, arr) => i && table.forEach((code, i) => arr[0][code] = i));
const tablesH = [
  new Uint8Array(128).fill(~0),
  new Uint8Array('0123456789ABCDEF'.split('').map(c => c.charCodeAt(0))),
  new Uint8Array('0123456789abcdef'.split('').map(c => c.charCodeAt(0))),
] as const;
tablesH.forEach((table, i, arr) => i && table.forEach((code, i) => arr[0][code] = i));
const tablesF = [
  new Uint8Array(128).fill(~0),
  new Uint8Array('SCPADRM BTIEHFUL'.split('').map(c => c.charCodeAt(0))),
  new Uint8Array('scpadrm btiehful'.split('').map(c => c.charCodeAt(0))),
] as const;
tablesF.forEach((table, i, arr) => i && table.forEach((code, i) => arr[0][code] = i));
const tablesL = [
  new Uint8Array(128).fill(~0),
  new Uint8Array('DHTNSLRC YPAOEUI'.split('').map(c => c.charCodeAt(0))).reverse(),
  new Uint8Array('dhtnslrc ypaoeui'.split('').map(c => c.charCodeAt(0))).reverse(),
] as const;
tablesL.forEach((table, i, arr) => i && table.forEach((code, i) => arr[0][code] = i));
const tablesR = [
  new Uint8Array(128).fill(~0),
  new Uint8Array('DHTNSLR CYPAOEUI'.split('').map(c => c.charCodeAt(0))),
  new Uint8Array('dhtnslr cypaoeui'.split('').map(c => c.charCodeAt(0))),
] as const;
tablesR.forEach((table, i, arr) => i && table.forEach((code, i) => arr[0][code] = i));
assert(tablesL[0][7] === tablesR[0][7]);
const layout = 'ZQJKXFYPAOEUIDHTNSLRCGBMWV';
const frequency = [
  ...[...Array(32)].map(() => tablesF),
  ...[...Array(16)].map(() => tablesF),
  ...'0123456789'.split('').map(() => tablesN),
  ...`:;<=>?@`.split('').map(() => tablesF),
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c => layout.indexOf(c) < 13 ? tablesR : tablesL),
  ...'[\\]^_`'.split('').map(() => tablesF),
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c => layout.indexOf(c) < 13 ? tablesR : tablesL),
  ...'{|}~\x7f'.split('').map(() => tablesF),
] as const;
const axisU = 'A'.charCodeAt(0);
const axisL = 'a'.charCodeAt(0);
const axisN = '0'.charCodeAt(0);
const axisH = 0;
const axisB = axisL;
const enum Segment {
  Upper = 0,
  Lower = 1,
  Number = 2,
  Other = 3,
}
function segment(code: number): Segment {
  if (0x30 <= code && code <= 0x39) {
    return Segment.Number;
  }
  if (0x41 <= code && code <= 0x5a) {
    return Segment.Upper;
  }
  if (0x61 <= code && code <= 0x7a) {
    return Segment.Lower;
  }
  else {
    return Segment.Other;
  }
}
function align(code: number, base: number, axis: number): number {
  randstate = false;
  switch (segment(code)) {
    case Segment.Upper:
      switch (segment(base)) {
        // ABBR
        case Segment.Upper:
          hexstate = isHEX(code);
          if (hexstate >>> 4 && axis === axisH) return axisH;
          incFreq(Segment.Upper);
          return axisU;
        // CamelCase
        case Segment.Lower:
          hexstate = isHEX(code);
          randstate = true;
          return axisL;
        // 0HDU
        case Segment.Number:
          hexstate = isHEX(code);
          if (hexstate >>> 4) return axisH;
          return axisU;
        // ^Case
        // _Case
        case Segment.Other:
          hexstate = isHEX(code);
          if (hexstate >>> 4) return axisH;
          return freq >>> 2 > (freq & 0b11)
            ? axisU
            : axisL;
      }
    case Segment.Lower:
      switch (segment(base)) {
        case Segment.Upper:
          hexstate = isHEX(code);
          incFreq(Segment.Lower);
          return axisL;
        case Segment.Lower:
          hexstate = isHEX(code);
          if (hexstate >>> 4 && axis === axisH) return axisH;
          return axisL;
        case Segment.Number:
          hexstate = isHEX(code);
          if (hexstate >>> 4) return axisH;
          return axisL;
        case Segment.Other:
          hexstate = isHEX(code);
          if (hexstate >>> 4) return axisH;
          return axisL;
      }
    case Segment.Number:
      switch (segment(base)) {
        case Segment.Upper:
          hexstate = isHEX(code);
          if (hexstate >>> 4) return axisH;
          return axisN;
        case Segment.Lower:
          hexstate = isHEX(code);
          if (hexstate >>> 4) return axisH;
          return axisN;
        case Segment.Number:
          if (hexstate >>> 4 && axis === axisH) return axisH;
          return axisN;
        case Segment.Other:
          hexstate = isHEX(code);
          if (hexstate >>> 4) return axisH;
          return axisN;
      }
    case Segment.Other:
      hexstate = (hexstate >>> 4 & hexstate) > 1 && (code === 0x2d || code === 0x3a) ? hexstate : 0;
      switch (segment(base)) {
        // J.Doe
        case Segment.Upper:
          return axis && axisU;
        // z and
        case Segment.Lower:
          return axis && axisL;
        // 0.0
        case Segment.Number:
          return axis && axisN;
        // , and
        case Segment.Other:
          return axis;
      }
  }
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
const seps = Uint8Array.from(Array(128), (_, i) =>
  ' .:-,/_\t'.includes(String.fromCharCode(i)) ? i : 0);
let sep = 0;
function encCode(code: number, base: number, axis: number): number {
  let delta = 1 << 7;
  switch (axis) {
    case axisU:
    case axisL: {
      const tables = frequency[base];
      if (tables !== tablesH && code === sep) return 7;
      if (code < axis || axis + 26 - 1 < code) break;
      delta = tables[0][code];
      break;
    }
    case axisN: {
      const tables = frequency[axis <= base && base < axis + 10 ? base : axis];
      if (code < axis && axis + 10 - 1 < code) break;
      delta = tables[0][code];
      break;
    }
  }
  sep = seps[code] || sep;
  return delta;
}
function decDelta(delta: number, base: number, axis: number): number {
  let code: number;
  switch (axis) {
    case axisU:
    case axisL: {
      const tables = frequency[base];
      if (tables !== tablesH && delta === 7) return sep;
      code = tables[axis === axisU ? 1 : 2][delta];
      break;
    }
    case axisN: {
      const tables = frequency[axis <= base && base < axis + 10 ? base : axis];
      code = tables[1][delta];
      break;
    }
    default:
      throw 0;
  }
  sep = seps[code] || sep;
  return code;
}
let randstate = false;
// 乱数が改行で終端されると非常に非効率となるため=を含めず終端文字として使用することで軽減。
// 1文字足すかクオートなどで囲んで改行回避したほうがかえって効率的。
// 実際に改行で終端される場合は少ない。
const random = Uint8Array.from(Array(128), (_, i) =>
  +'1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/-_%'
    .includes(String.fromCharCode(i)));
function reset(): void {
  randstate = false;
  hexstate = 0;
}
function clear(): void {
  reset();
  freq = 0;
  sep = 0x20;
  hopts.skip = 0;
}

const popts = {
  start: 0,
  next: 0,
};

const hopts = {
  target: random,
  start: 0,
  next: 0,
  skip: 0,
};

export function encode(input: string, huffman = true): string {
  clear();
  let output = '';
  let axis = axisB;
  let base = sep;
  let buffer = 0;
  for (let i = 0, j = 0; i < input.length; ++i) {
    const code = input.charCodeAt(i);
    assert(code >>> 8 === 0);
    if (j === 0) {
      if (i + 1 === input.length) {
        output += ASCII[code];
        break;
      }
      if (code === 0x25) {
        popts.start = i;
        output += encodePercent(input, tablesH[0], popts) || '%';
        i = popts.next === i ? i + 1 : popts.next;
        output += input[i] ?? '';
        reset();
        continue;
      }
      if (huffman && randstate && i >= hopts.skip) {
        hopts.start = hopts.skip = i;
        output += encodeToken(input, hopts);
        i = hopts.next - 1;
        reset();
        continue;
      }
      const comp = axis === axisH && isHEX(code) >>> 4 !== 0;
      const delta = comp
        ? tablesH[0][code]
        : encCode(code, base, axis);
      if (delta >>> 4 || axis === axisH && !comp || i < hopts.skip) {
        output += ASCII[code];
      }
      else {
        buffer = delta << 3;
        ++j;
      }
    }
    else {
      const sep$ = sep;
      const comp = axis === axisH && isHEX(code) >>> 4 !== 0;
      const delta = comp
        ? tablesH[0][code]
        : encCode(code, base, axis);
      if (delta >>> 3 || axis === axisH && !comp) {
        if (!comp) {
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
        assert(buffer >>> 8 === 0);
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

export function decode(input: string, huffman = true): string {
  clear();
  let output = '';
  let axis = axisB;
  let base = sep;
  let caseH = 2;
  for (let i = 0; i < input.length; ++i) {
    let code = input.charCodeAt(i);
    assert(code >>> 8 === 0);
    if (code === 0x25) {
      popts.start = i;
      output += decodePercent(input, tablesH[1], popts) || '%';
      i = popts.next === i ? i + 1 : popts.next;
      output += input[i] ?? '';
      reset();
      continue;
    }
    else if (code <= 0x7f) {
      output += ASCII[code];
      sep = seps[code] || sep;
    }
    else if (huffman && randstate) {
      hopts.start = i;
      output += decodeToken(input, hopts);
      i = hopts.next - 1;
      reset();
      continue;
    }
    else {
      const delta = code;
      code = axis == axisH
        ? tablesH[caseH][delta >>> 3 & 0b1111]
        : decDelta(delta >>> 3 & 0b1111, base, axis);
      output += ASCII[code];
      axis = align(code, base, axis);
      base = code;
      caseH = segment(base) <= Segment.Lower ? segment(base) + 1 : caseH;
      code = axis == axisH
        ? tablesH[caseH][delta & 0b111]
        : decDelta(delta & 0b0111, base, axis);
      output += ASCII[code];
    }
    axis = align(code, base, axis);
    base = code;
    caseH = segment(base) <= Segment.Lower ? segment(base) + 1 : caseH;
  }
  return output;
}
