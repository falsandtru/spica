export function concat<T>(target: T[], source: readonly T[]): T[] {
  target.push(...source);
  return target;
}
