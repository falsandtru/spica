import { Number } from './global';

const zeros = '0'.repeat(15);
let cnt = 0;

export function sqid(): string
export function sqid(id: number): string
export function sqid(id?: number): string {
  if (arguments.length > 0) {
    if (typeof id !== 'number') throw new TypeError(`Spica: sqid: A parameter value must be a number: ${id}`);
    if (id >= 0 === false) throw new TypeError(`Spica: sqid: A parameter value must be a positive number: ${id}`);
    if (id % 1 !== 0) throw new TypeError(`Spica: sqid: A parameter value must be an integer: ${id}`);
    return (zeros + id).slice(-15);
  }
  else {
    if (cnt === Number.MAX_SAFE_INTEGER) throw new TypeError(`Spica: sqid: sqid reached max safe integer.`);
    return sqid(++cnt)
  }
}
