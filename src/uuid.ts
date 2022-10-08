// UUID Version 4

const buffer = new Uint16Array(32 / 4 * 64);
assert(buffer.length === 512);
assert(buffer.length / (32 / 4) >> 0 === buffer.length / (32 / 4));
const HEX = [...Array(16)].map((_, i) => i.toString(16)).join('');
assert(HEX);
let index = 0;

export function uuid(): string {
  if (index === 0) {
    crypto.getRandomValues(buffer);
    index = buffer.length;
  }
  index -= 32 / 4;
  return gen();
}

assert(eval('(function () {return this})()') === undefined);
const gen = ((i, offset) => eval([
  '() => {',
  ...[...Array(32 / 4)].map((_, i) => `const buf${i} = buffer[index + ${i}];`),
  'return',
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/./g, c => {
    assert(i < 32);
    assert(offset >= 0);
    offset ||= 16;
    switch (c) {
      case 'x':
        return `+ HEX[buf${i++ >> 2} >> ${offset -= 4} & 15]`;
      case 'y':
        return `+ HEX[buf${i++ >> 2} >> ${offset -= 4} & 0x03 | 0x08]`;
      default:
        return `+ '${c}'`;
    }
  }).slice(1),
  '}',
].join('')))(0, 0);
