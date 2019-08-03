export function concat<T>(target: T[], source: Iterable<T>): T[] {
  return void target.push(...source), target;
}
