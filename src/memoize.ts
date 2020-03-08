import { undefined } from './global';
import { Collection } from './collection';

export function memoize<a, z, b = a>(f: (a: a) => z, memory?: Collection<b, z>, identify?: (a: a) => b): typeof f;
export function memoize<f extends (...as: [unknown, ...unknown[]]) => unknown, b = Parameters<f>[0]>(f: f, memory?: Collection<b, ReturnType<f>>, identify?: (...as: Parameters<f>) => b): f;
export function memoize<as extends [unknown, ...unknown[]], z, b = as[0]>(f: (...as: as) => z, memory?: Collection<b, z>, identify?: (...as: as) => b): typeof f;
export function memoize<as extends [unknown, ...unknown[]], z, b = as[0]>(f: (...as: as) => z, memory: Collection<b, z> = new Map(), identify: (...as: as) => b = (...as) => as[0] as b): typeof f {
  let nullish = false;
  return (...as) => {
    const b = identify(...as);
    let z = memory.get(b);
    if (z !== undefined || nullish && memory.has(b)) return z!;
    z = f(...as);
    nullish = nullish || z === undefined;
    memory.set(b, z);
    return z;
  };
}
