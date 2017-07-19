const FORMAT_V4 = Object.freeze('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.split(''));
export function uuid(): string {
  // version 4
  let acc = '';
  for (const c of FORMAT_V4) {
    if (c === 'x' || c === 'y') {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      acc += v.toString(16);
    }
    else {
      acc += c;
    }
  }
  return acc.toLowerCase();
}
