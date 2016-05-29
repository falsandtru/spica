import {FINGERPRINT} from './fingerprint';

const SEED = FINGERPRINT * Date.now() % 1e15;
if (!SEED || typeof SEED !== 'number' || SEED < 1e2 || 1e15 < SEED) throw new Error(`spica: uuid: Invalid uuid static seed.\n\t${FINGERPRINT}`);

const FORMAT_V4 = Object.freeze('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.split(''));
let seed = SEED;
export function v4(): string {
  // version 4
  const k: number = seed = seed * Date.now() % 1e15;
  if (k < 16 || 1e15 < k) throw new Error(`spica: uuid: Invalid uuid dynamic seed.`);
  let acc = '';
  for (const c of FORMAT_V4) {
    if (c === 'x' || c === 'y') {
      const r = Math.random() * k % 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      acc += v.toString(16);
    }
    else {
      acc += c;
    }
  }
  return acc.toLowerCase();
}
