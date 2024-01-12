import { min } from './alias';

const ASCII = [...Array(256)].reduce<string>((acc, _, i) => acc + String.fromCharCode(i), '');
function isHEX(code: number): boolean {
  return 0x41 <= code && code < 0x47
      || 0x30 <= code && code < 0x3a;
}

interface Options {
  start: number;
  next: number;
}

export function encode(input: string, table: Uint8Array, opts: Options): string {
  let output = '';
  let buffer = 0;
  let count = 0;
  for (let i = opts.next = opts.start; i + 2 < input.length; opts.next = ++i) {
    if (input[i] !== '%') break;
    const code1 = input.charCodeAt(++i);
    if (!isHEX(code1)) break;
    const code2 = input.charCodeAt(++i);
    if (!isHEX(code2)) break;
    const delta1 = table[code1];
    assert(delta1 >>> 4 === 0);
    const delta2 = table[code2];
    assert(delta2 >>> 4 === 0);
    const hcode = 1 << 8 | delta1 << 4 | delta2;
    let hlen = 9;
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
      buffer = 0;
      count = 0;
    }
  }
  if (count !== 0) {
    assert(count < 8);
    output += ASCII[buffer];
  }
  assert(output.length <= input.length);
  return output;
}

export function decode(input: string, table: Uint8Array, opts: Options): string {
  let output = '';
  let buffer = 0;
  let count = 0;
  for (let i = opts.next = opts.start; i < input.length; opts.next = ++i) {
    buffer <<= 8;
    buffer |= input.charCodeAt(i);
    count += 8;
    assert(count <= 16);
    if ((buffer >>> count - 1 & 1) === 0) break;
    if (count < 9) continue;
    const delta = buffer >>> count - 9 & 0xff;
    output += `%${ASCII[table[delta >>> 4]]}${ASCII[table[delta & 0x0f]]}`;
    count -= 9;
  }
  return output;
}
