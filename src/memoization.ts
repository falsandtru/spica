import { Collection } from './collection';

export function memoize<a, z>(f: (a: a) => z, memory: Collection<a, z> = new Map()): typeof f {
  return a =>
    memory.has(a)
      ? memory.get(a)!
      : void memory.set(a, f(a)) || memory.get(a)!;
}
