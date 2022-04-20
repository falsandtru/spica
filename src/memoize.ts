import { Map } from './global';
import { isArray } from './alias';
import { Collection } from './collection';
import { equal } from './compare';

export function memoize<f extends (...as: [unknown, ...unknown[]]) => unknown, b = Parameters<f>[0]>(f: f, memory?: Collection<b, ReturnType<f>>): f;
export function memoize<f extends (...as: [number, ...unknown[]]) => unknown, b extends number = Parameters<f>[0]>(f: f, memory: ReturnType<f>[]): f;
export function memoize<f extends (...as: [unknown, ...unknown[]]) => unknown, b = Parameters<f>[0]>(f: f, identify?: (...as: Parameters<f>) => b, memory?: Collection<b, ReturnType<f>>): f;
export function memoize<f extends (...as: [unknown, ...unknown[]]) => unknown, b extends number = number>(f: f, identify: (...as: Parameters<f>) => b, memory: ReturnType<f>[]): f;
export function memoize<a, z, b = a>(f: (a: a) => z, memory?: Collection<b, z>): typeof f;
export function memoize<a extends number, z, b extends number = a>(f: (a: a) => z, memory: z[]): typeof f;
export function memoize<a, z, b = a>(f: (a: a) => z, identify?: (a: a) => b, memory?: Collection<b, z>): typeof f;
export function memoize<a, z, b extends number = number>(f: (a: a) => z, identify: (a: a) => b, memory: z[]): typeof f;
export function memoize<as extends [unknown, ...unknown[]], z, b = as[0]>(f: (...as: as) => z, memory?: Collection<b, z>): typeof f;
export function memoize<as extends [number, ...unknown[]], z, b extends number = as[0]>(f: (...as: as) => z, memory: z[]): typeof f;
export function memoize<as extends [unknown, ...unknown[]], z, b = as[0]>(f: (...as: as) => z, identify?: (...as: as) => b, memory?: Collection<b, z>): typeof f;
export function memoize<as extends [unknown, ...unknown[]], z, b extends number = number>(f: (...as: as) => z, identify: (...as: as) => b, memory: z[]): typeof f;
export function memoize<as extends [unknown, ...unknown[]], z, b = as[0]>(f: (...as: as) => z, identify: Collection<b, z> | z[] | ((...as: as) => b) = (...as) => as[0] as b, memory?: Collection<b, z> | z[]): typeof f {
  if (typeof identify === 'object') return memoize(f, void 0, identify as Collection<b, z>);
  if (memory === void 0) return memoize(f, identify, new Map());
  if (isArray(memory)) return memoize(f, identify, {
    has(key) {
      assert(memory = memory as z[]);
      return memory[key as any as number] !== void 0;
    },
    get(key) {
      assert(memory = memory as z[]);
      assert(0 <= <any>key);
      return memory[key as any as number];
    },
    set(key, value) {
      assert(memory = memory as z[]);
      memory[key as any as number] = value;
      return this;
    },
    delete() {
      throw 0;
    },
  } as Collection<b, z>);
  let nullish = false;
  return (...as) => {
    assert(memory = memory as Collection<b, z>);
    const b = identify(...as);
    let z = memory.get(b);
    if (z !== void 0 || nullish && memory.has(b)) return z!;
    z = f(...as);
    nullish ||= z === void 0;
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
  let key: b = [] as any;
  let val: z = [] as any;
  return (...as) => {
    const b = identify(...as);
    if (!equal(key, b)) {
      key = b;
      val = f(...as);
    }
    return val;
  };
}
