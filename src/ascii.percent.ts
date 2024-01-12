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
    const delta = delta2 << 7 & 0xff | delta1 << 3 | delta2 >>> 1;
    if (delta <= 0x7f) {
      output += `%${ASCII[code1]}${ASCII[code2]}`;
      continue;
    }
    output ||= '%';
    output += ASCII[delta];
  }
  assert(output.length <= input.length);
  return output;
}

export function decode(input: string, table: Uint8Array, opts: Options): string {
  let output = '';
  for (let i = opts.next = opts.start; i < input.length; opts.next = ++i) {
    const code = input.charCodeAt(i);
    assert(code >>> 8 === 0);
    if (code <= 0x7f) {
      const char0 = code;
      if (char0 !== 0x25) break;
      const char1 = input.charCodeAt(++i);
      if (output === '' && char1 >>> 7 !== 0) {
        --i;
        continue;
      }
      if (!isHEX(char1)) break;
      const char2 = input.charCodeAt(++i);
      if (!isHEX(char2)) break;
      output += `%${ASCII[char1]}${ASCII[char2]}`;
    }
    else {
      output += `%${ASCII[table[code >>> 3 & 0x0f]]}${ASCII[table[code << 1 & 0x0f | code >>> 7]]}`;
    }
  }
  return output;
}
