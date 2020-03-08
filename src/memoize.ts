import { undefined } from './global';
import { Collection } from './collection';

export function memoize<a, z>(f: (a: a) => z, memory: Collection<a, z> = new Map()): typeof f {
  let nullish = false;
  return a => {
    let z = memory.get(a);
    if (z !== undefined || nullish && memory.has(a)) return z!;
    z = f(a);
    nullish = nullish || z === undefined;
    memory.set(a, z);
    return z;
  };
}
