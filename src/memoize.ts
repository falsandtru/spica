import { undefined, Map } from './global';
import { Collection } from './collection';

export function memoize<f extends (...as: [unknown, ...unknown[]]) => unknown, b = Parameters<f>[0]>(f: f, memory?: Collection<b, ReturnType<f>>): f;
export function memoize<f extends (...as: [unknown, ...unknown[]]) => unknown, b = Parameters<f>[0]>(f: f, identify?: (...as: Parameters<f>) => b, memory?: Collection<b, ReturnType<f>>): f;
export function memoize<a, z, b = a>(f: (a: a) => z, memory?: Collection<b, z>): typeof f;
export function memoize<a, z, b = a>(f: (a: a) => z, identify?: (a: a) => b, memory?: Collection<b, z>): typeof f;
export function memoize<as extends [unknown, ...unknown[]], z, b = as[0]>(f: (...as: as) => z, memory?: Collection<b, z>): typeof f;
export function memoize<as extends [unknown, ...unknown[]], z, b = as[0]>(f: (...as: as) => z, identify?: (...as: as) => b, memory?: Collection<b, z>): typeof f;
export function memoize<as extends [unknown, ...unknown[]], z, b = as[0]>(f: (...as: as) => z, identify: Collection<b, z> | ((...as: as) => b) = (...as) => as[0] as b, memory?: Collection<b, z>): typeof f {
  if (typeof identify === 'object') return memoize(f, undefined, identify);
  if (memory === undefined) return memoize(f, identify, new Map());
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
