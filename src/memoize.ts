import type { NonNull } from './type';
import { isArray } from './alias';
import { equal } from './compare';

interface Cache<K, V> {
  add?(key: K, value: V): NonNull;
  set(key: K, value: V): this;
  get(key: K): V | undefined;
  has(key: K): boolean;
}

export function memoize<f extends (...as: [unknown, ...unknown[]]) => unknown, b = Parameters<f>[0]>(f: f, memory?: Cache<b, ReturnType<f>>): f;
export function memoize<f extends (...as: [number, ...unknown[]]) => unknown, b extends number = Parameters<f>[0]>(f: f, memory: Record<b, ReturnType<f>>): f;
export function memoize<f extends (...as: [unknown, ...unknown[]]) => unknown, b = Parameters<f>[0]>(f: f, identify: (...as: Parameters<f>) => b, memory?: Cache<b, ReturnType<f>>): f;
export function memoize<f extends (...as: [unknown, ...unknown[]]) => unknown, b extends number = number>(f: f, identify: (...as: Parameters<f>) => b, memory: Record<b, ReturnType<f>>): f;
export function memoize<a, z, b = a>(f: (a: a) => z, memory?: Cache<b, z>): typeof f;
export function memoize<a extends number, z, b extends number = a>(f: (a: a) => z, memory: Record<b, z>): typeof f;
export function memoize<a, z, b = a>(f: (a: a) => z, identify: (a: a) => b, memory?: Cache<b, z>): typeof f;
export function memoize<a, z, b extends number = number>(f: (a: a) => z, identify: (a: a) => b, memory: Record<b, z>): typeof f;
export function memoize<as extends [unknown, ...unknown[]], z, b = as[0]>(f: (...as: as) => z, memory?: Cache<b, z>): typeof f;
export function memoize<as extends [number, ...unknown[]], z, b extends number = as[0]>(f: (...as: as) => z, memory: Record<b, z>): typeof f;
export function memoize<as extends [unknown, ...unknown[]], z, b = as[0]>(f: (...as: as) => z, identify: (...as: as) => b, memory?: Cache<b, z>): typeof f;
export function memoize<as extends [unknown, ...unknown[]], z, b extends number = number>(f: (...as: as) => z, identify: (...as: as) => b, memory: Record<b, z>): typeof f;
export function memoize<as extends [unknown, ...unknown[]], z, b = as[0]>(f: (...as: as) => z, identify?: Cache<b, z> | Record<number, z> | ((...as: as) => b), memory?: Cache<b, z> | Record<number, z>): typeof f {
  if (typeof identify === 'object') {
    memory = identify;
    identify = undefined;
  }
  identify ??= (...as) => as[0] as b;
  switch (true) {
    case isArray(memory):
      return memoizeArray(f, identify, memory as z[]);
    case memory?.constructor === Object:
      return memoizeObject(f, identify, memory as Record<number, z>);
    default:
      return memoizeDict(f, identify, memory as Cache<b, z> ?? new Map());
  }
}
function memoizeArray<as extends [unknown, ...unknown[]], z, b = as[0]>(
  f: (...as: as) => z,
  identify: (...as: as) => b,
  memory: z[],
): typeof f {
  return (...as) => {
    const b = identify(...as) as number;
    let z = memory[b];
    if (z !== undefined) return z!;
    z = f(...as);
    memory[b] = z;
    return z;
  };
}
function memoizeObject<as extends [unknown, ...unknown[]], z, b = as[0]>(
  f: (...as: as) => z,
  identify: (...as: as) => b,
  memory: Record<number, z>,
): typeof f {
  let nullable = false;
  return (...as) => {
    const b = identify(...as) as number;
    let z = memory[b];
    if (z !== undefined || nullable && b in memory) return z!;
    z = f(...as);
    nullable ||= z === undefined;
    memory[b] = z;
    return z;
  };
}
function memoizeDict<as extends [unknown, ...unknown[]], z, b = as[0]>(
  f: (...as: as) => z,
  identify: (...as: as) => b,
  memory: Cache<b, z>,
): typeof f {
  let nullable = false;
  return (...as) => {
    const b = identify(...as);
    let z = memory.get(b);
    if (z !== undefined || nullable && memory.has(b)) return z!;
    z = f(...as);
    nullable ||= z === undefined;
    memory.add?.(b, z) ?? memory.set(b, z);
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
