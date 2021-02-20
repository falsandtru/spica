import { crypto } from './global';

const FORMAT_V4 = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

export function uuid(): string {
  // version 4
  return body(rnd16, hex);
}

const body = Function('rnd16', 'hex', [
  '"use strict";',
  'return ""',
  FORMAT_V4.replace(/./g, c => {
    switch (c) {
      case 'x':
        return `+ hex[rnd16()]`;
      case 'y':
        return `+ hex[rnd16() & 0x03 | 0x08]`;
      default:
        return `+ '${c}'`;
    }
  }),
].join(''));

const buffer = new Uint16Array(512);
const digit = 16;
const mask = 0b1111;
let index = buffer.length;
let offset = digit;

function rnd16(): number {
  if (index === buffer.length) {
    crypto.getRandomValues(buffer);
    index = 0;
    assert(offset === digit);
  }
  if (offset > 4) {
    offset -= 4;
    assert((buffer[index] >> offset & mask) >= 0);
    assert((buffer[index] >> offset & mask) < 16);
    return buffer[index] >> offset & mask;
  }
  else {
    assert(offset === 4);
    offset = digit;
    assert((buffer[index] & mask) >= 0);
    assert((buffer[index] & mask) < 16);
    return buffer[index++] & mask;
  }
}

const hex = [...Array(16)].map((_, i) => i.toString(16));
