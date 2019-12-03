const FORMAT_V4 = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
const { random } = Math;

export function uuid(): string {
  // version 4
  let acc = '';
  for (let i = 0; i < FORMAT_V4.length; ++i) {
    const c = FORMAT_V4[i];
    if (c === 'x' || c === 'y') {
      const r = random() * 16 | 0;
      const v = c == 'x' ? r : r & 0x3 | 0x8;
      acc += v.toString(16);
    }
    else {
      acc += c;
    }
  }
  return acc;
}
