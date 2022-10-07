// Version 4

const format = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

export function uuid(): string {
  let acc = '';
  for (let i = 0; i < format.length; ++i) {
    const c = format[i];
    switch (c) {
      case 'x':
        acc += HEX[rnd16()];
        continue
      case 'y':
        acc += HEX[rnd16() & 0x03 | 0x08];
        continue
      default:
        acc += c;
        continue
    }
  }
  return acc;
}

const HEX = [...Array(16)].map((_, i) => i.toString(16)).join('');

const buffer = new Uint16Array(512);
assert(buffer.length % 4 === 0);
const digit = 16;
const mask = digit - 1;
let index = buffer.length;
let rnd = 2 ** digit;
let offset = digit;

function rnd16(): number {
  if (rnd === 2 ** digit) {
    assert(index === buffer.length);
    crypto.getRandomValues(buffer);
    index = 0;
    rnd = buffer[index];
    assert(offset === digit);
  }
  if (offset === 4) {
    offset = digit;
    assert((rnd & mask) >= 0);
    assert((rnd & mask) < 16);
    const r = rnd & mask;
    rnd = buffer[++index] ?? 2 ** digit;
    return r;
  }
  else {
    assert(offset > 4);
    offset -= 4;
    assert((rnd >> offset & mask) >= 0);
    assert((rnd >> offset & mask) < 16);
    return rnd >> offset & mask;
  }
}
