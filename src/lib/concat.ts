export function concat<T>(target: T[], source: T[]): T[]
export function concat<T>(target: T[], source: { [index: number]: T; length: number; }): T[]
export function concat<T>(target: T[], source: T[] | { [index: number]: T; length: number; }): T[] {
  for (let i = 0, len = source.length, offset = target.length; i < len; ++i) {
    target[i + offset] = source[i];
  }
  return target;
}
