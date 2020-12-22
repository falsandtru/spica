import { crypto } from './global';

const FORMAT_V4 = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

export function uuid(): string {
  // version 4
  let acc = '';
  for (let i = 0; i < FORMAT_V4.length; ++i) {
    acc += calc(FORMAT_V4[i]);
  }
  return acc;
}

function calc(c: string): string {
  if (c === 'x' || c === 'y') {
    const r = rnd16();
    assert(r <= 16);
    const v = c === 'x' ? r : r & 0x03 | 0x08;
    return hex[v];
  }
  else {
    return c;
  }
}

const buffer = new Uint16Array(256);
const scale = 1 << 16;
let index = buffer.length;
let denom = scale;

function rnd16(): number {
  if (index === buffer.length) {
    crypto.getRandomValues(buffer);
    index = 0;
  }
  if (denom > 16) {
    denom = denom / 16;
    const rnd = buffer[index];
    buffer[index] = rnd % denom;
    return rnd / denom | 0;
  }
  else {
    denom = scale;
    return buffer[index++] % 16;
  }
}

const hex = [...Array(16)].map((_, i) => i.toString(16));
