export function concat<T>(target: T[], source: readonly T[]): T[] {
  for (let i = 0; i < source.length; ++i) {
    target.push(source[i]);
  }
  return target;
}
