import { isArray } from './alias';
import { Dict } from './dict';
import { equal } from './compare';

export function memoize<f extends (...as: [unknown, ...unknown[]]) => unknown, b = Parameters<f>[0]>(f: f, memory?: Dict<b, ReturnType<f>>): f;
export function memoize<f extends (...as: [number, ...unknown[]]) => unknown, b extends number = Parameters<f>[0]>(f: f, memory: ReturnType<f>[]): f;
export function memoize<f extends (...as: [unknown, ...unknown[]]) => unknown, b = Parameters<f>[0]>(f: f, identify?: (...as: Parameters<f>) => b, memory?: Dict<b, ReturnType<f>>): f;
export function memoize<f extends (...as: [unknown, ...unknown[]]) => unknown, b extends number = number>(f: f, identify: (...as: Parameters<f>) => b, memory: ReturnType<f>[]): f;
export function memoize<a, z, b = a>(f: (a: a) => z, memory?: Dict<b, z>): typeof f;
export function memoize<a extends number, z, b extends number = a>(f: (a: a) => z, memory: z[]): typeof f;
export function memoize<a, z, b = a>(f: (a: a) => z, identify?: (a: a) => b, memory?: Dict<b, z>): typeof f;
export function memoize<a, z, b extends number = number>(f: (a: a) => z, identify: (a: a) => b, memory: z[]): typeof f;
export function memoize<as extends [unknown, ...unknown[]], z, b = as[0]>(f: (...as: as) => z, memory?: Dict<b, z>): typeof f;
export function memoize<as extends [number, ...unknown[]], z, b extends number = as[0]>(f: (...as: as) => z, memory: z[]): typeof f;
export function memoize<as extends [unknown, ...unknown[]], z, b = as[0]>(f: (...as: as) => z, identify?: (...as: as) => b, memory?: Dict<b, z>): typeof f;
export function memoize<as extends [unknown, ...unknown[]], z, b extends number = number>(f: (...as: as) => z, identify: (...as: as) => b, memory: z[]): typeof f;
export function memoize<as extends [unknown, ...unknown[]], z, b = as[0]>(f: (...as: as) => z, identify: Dict<b, z> | z[] | ((...as: as) => b) = (...as) => as[0] as b, memory?: Dict<b, z> | z[]): typeof f {
  if (typeof identify === 'object') return memoize(f, undefined, identify as Dict<b, z>);
  return isArray(memory)
    ? memoizeArray(f, identify, memory)
    : memoizeObject(f, identify, memory ?? new Map());
}
function memoizeArray<as extends [unknown, ...unknown[]], z, b = as[0]>(f: (...as: as) => z, identify: (...as: as) => b, memory: z[]): typeof f {
  let nullish = false;
  return (...as) => {
    const b = identify(...as) as number;
    let z = memory[b];
    if (z !== undefined || nullish && memory[b] !== undefined) return z!;
    z = f(...as);
    nullish ||= z === undefined;
    memory[b] = z;
    return z;
  };
}
function memoizeObject<as extends [unknown, ...unknown[]], z, b = as[0]>(f: (...as: as) => z, identify: (...as: as) => b, memory: Dict<b, z>): typeof f {
  let nullish = false;
  return (...as) => {
    const b = identify(...as);
    let z = memory.get(b);
    if (z !== undefined || nullish && memory.has(b)) return z!;
    z = f(...as);
    nullish ||= z === undefined;
    memory.set(b, z);
    return z;
  };
}

export function reduce<f extends (...as: [unknown, ...unknown[]]) => unknown, b = Parameters<f>[0]>(f: f): f;
export function reduce<f extends (...as: [unknown, ...unknown[]]) => unknown, b = Parameters<f>[0]>(f: f, identify?: (...as: Parameters<f>) => b): f;
export function reduce<a, z, b = a>(f: (a: a) => z): typeof f;
export function reduce<a, z, b = a>(f: (a: a) => z, identify?: (a: a) => b): typeof f;
export function reduce<as extends [unknown, ...unknown[]], z, b = as[0]>(f: (...as: as) => z): typeof f;
export function reduce<as extends [unknown, ...unknown[]], z, b = as[0]>(f: (...as: as) => z, identify?: (...as: as) => b): typeof f;
export function reduce<as extends [unknown, ...unknown[]], z, b = as[0]>(f: (...as: as) => z, identify: (...as: as) => b = (...as) => as[0] as b): typeof f {
  let key: b = {} as b;
  let val: z;
  return (...as) => {
    const b = identify(...as);
    if (!equal(key, b)) {
      key = b;
      val = f(...as);
    }
    return val;
  };
}
