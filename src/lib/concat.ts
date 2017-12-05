export function concat<T>(target: T[], source: T[]): T[] {
  for (let i = 0, offset = target.length, len = source.length; i < len; ++i) {
    target[offset + i] = source[i];
  }
  return target;
}
