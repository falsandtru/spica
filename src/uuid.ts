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
const scale = 1 << 16;
let index = buffer.length;
let denom = scale;

function rnd16(): number {
  if (index === buffer.length) {
    crypto.getRandomValues(buffer);
    index = 0;
  }
  if (denom ^ 16) {
    assert(denom > 16);
    assert(denom % 16 === 0);
    assert((denom >> 4) === denom / 16);
    denom >>= 4;
    const rnd = buffer[index];
    const mod = buffer[index] = rnd & (denom - 1);
    assert((rnd - mod) % denom === 0);
    return (rnd - mod) / denom;
  }
  else {
    assert(denom === 16);
    assert(buffer[index] < 16);
    denom = scale;
    return buffer[index++];
  }
}

const hex = [...Array(16)].map((_, i) => i.toString(16));
