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
    assert(r === (r | 0));
    assert(0 <= r && r < 16);
    const v = c === 'x' ? r : r & 0x03 | 0x08;
    assert(v < hex.length);
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
