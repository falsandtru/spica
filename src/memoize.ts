import { undefined } from './global';
import { Collection } from './collection';

export function memoize<a, z>(f: (a: a) => z, memory: Collection<a, z> = new Map()): typeof f {
  return a => {
    let z = memory.get(a);
    if (z !== undefined || memory.has(a)) return z!;
    z = f(a);
    memory.set(a, z);
    return z;
  };
}
