// UUID Version 4

// 32: Closest power of 2 from the number of random values in a UUID.
// 4: Number of bits required to represent a hex number.
// 8: Number of 16 bit values required to create a UUID.

const digit = 16;
const unit = 32 / (digit / 4) as 8;
const buffer = new Uint16Array(unit * 64);
assert(buffer.length === 512);
const HEX = [...Array(16)].map((_, i) => i.toString(16)).join('');
assert(HEX.length === 16);
let index = 0;

export function uuid(): string {
  if (index === 0) {
    crypto.getRandomValues(buffer);
    index = buffer.length;
  }
  index -= unit;
  return gen();
}

assert(eval('(function () {return this})()') === undefined);
const gen = ((i, offset) => eval([
  '() => {',
  ...[...Array(unit)].map((_, i) =>
    `const buf${i} = buffer[index + ${i}];`),
  'return',
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/./g, c => {
    assert(i < 32);
    assert(offset >= 0);
    offset ||= digit;
    switch (c) {
      case 'x':
        return `+ HEX[buf${i++ >> 2} >> ${offset -= 4} & 0x0f]`;
      case 'y':
        return `+ HEX[buf${i++ >> 2} >> ${offset -= 4} & 0x03 | 0x08]`;
      default:
        return `+ '${c}'`;
    }
  }).slice(1),
  '}',
].join('')))(0, 0);
