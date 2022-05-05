import { isArray } from './alias';

export function concat<T>(target: T[], source: Iterable<T>): T[] {
  if (isArray(source)) {
    for (let i = 0; i < source.length; ++i) {
      target.push(source[i]);
    }
  }
  else {
    target.push(...source);
  }
  return target;
}
