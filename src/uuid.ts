import { crypto } from './global';

export function uuid(): string {
  // version 4
  return gen(rnd16, HEX);
}

assert(eval('(function () {return this})()') === undefined);
const gen = eval([
  '(rnd16, HEX) =>',
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/./g, c => {
    switch (c) {
      case 'x':
        return `+ HEX[rnd16()]`;
      case 'y':
        return `+ HEX[rnd16() & 0x03 | 0x08]`;
      default:
        return `+ '${c}'`;
    }
  }).slice(1),
].join(''));

const HEX = [...Array(16)].map((_, i) => i.toString(16));

const buffer = new Uint16Array(512);
assert(buffer.length % 4 === 0);
const digit = 16;
const mask = digit - 1;
let index = buffer.length;
let offset = digit;

function rnd16(): number {
  if (index === buffer.length) {
    crypto.getRandomValues(buffer);
    index = 0;
    assert(offset === digit);
  }
  if (offset === 4) {
    assert(offset === 4);
    offset = digit;
    assert((buffer[index] & mask) >= 0);
    assert((buffer[index] & mask) < 16);
    return buffer[index++] & mask;
  }
  else {
    assert(offset > 4);
    offset -= 4;
    assert((buffer[index] >> offset & mask) >= 0);
    assert((buffer[index] >> offset & mask) < 16);
    return buffer[index] >> offset & mask;
  }
}
