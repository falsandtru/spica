import { Object } from './global';
import { hasOwnProperty, ObjectCreate, ObjectKeys } from './alias';
import { type, isPrimitive } from './type';
import { push } from './array';

export const assign = template((prop, target, source) =>
  target[prop] = source[prop]);

export const clone = template((prop, target, source) => {
  switch (type(source[prop])) {
    case 'Array':
      return target[prop] = source[prop].slice();
    case 'Object':
      switch (type(target[prop])) {
        case 'Object':
          return target[prop] = clone(source[prop] instanceof Object ? {} : ObjectCreate(null), source[prop]);
        default:
          return target[prop] = source[prop];
      }
    default:
      return target[prop] = source[prop];
  }
});

export const extend = template((prop, target, source) => {
  switch (type(source[prop])) {
    case 'Array':
      return target[prop] = source[prop].slice();
    case 'Object':
      switch (type(target[prop])) {
        case 'Object':
          return target[prop] = extend(target[prop], source[prop]);
        default:
          return target[prop] = extend(source[prop] instanceof Object ? {} : ObjectCreate(null), source[prop]);
      }
    default:
      return target[prop] = source[prop];
  }
});

export const merge = template((prop, target, source) => {
  switch (type(source[prop])) {
    case 'Array':
      switch (type(target[prop])) {
        case 'Array':
          return target[prop] = push(target[prop], source[prop]);
        default:
          return target[prop] = source[prop].slice();
      }
    case 'Object':
      switch (type(target[prop])) {
        case 'Object':
          return target[prop] = merge(target[prop], source[prop]);
        default:
          return target[prop] = merge(source[prop] instanceof Object ? {} : ObjectCreate(null), source[prop]);
      }
    default:
      return target[prop] = source[prop];
  }
});

export const inherit = template((prop, target, source) => {
  switch (type(source[prop])) {
    case 'Array':
      return target[prop] = source[prop].slice();
    case 'Object':
      switch (type(target[prop])) {
        case 'Object':
          assert([Object.prototype, null].includes(Object.getPrototypeOf(source[prop])));
          return target[prop] = isOwnProperty(target, prop)
            ? inherit(target[prop], source[prop])
            : inherit(ObjectCreate(target[prop]), source[prop]);
        default:
          return target[prop] = ObjectCreate(source[prop]);
      }
    default:
      return target[prop] = source[prop];
  }
});

const isOwnProperty: (o: object, p: string) => boolean = '__proto__' in {}
  ? (o, p) => !('__proto__' in o) || o[p] !== o['__proto__'][p]
  : hasOwnProperty;

export function template(
  strategy: (prop: string, target: object, source: object) => void,
  empty = empty_) {
  return walk;

  function walk<T extends U, U extends object>(target: Partial<U>, source1: T, source2: Partial<U>, ...sources: Partial<U>[]): T;
  function walk<T extends U, U extends object>(target: T, source: Partial<U>, ...sources: Partial<U>[]): T;
  function walk<T extends object>(target: Partial<T>, source1: T, source2: Partial<T>, ...sources: Partial<T>[]): T;
  function walk<T extends object>(target: T, ...sources: Partial<T>[]): T;
  function walk<T extends object>(target: T, ...sources: T[]): T {
    let isPrimitiveTarget = isPrimitive(target);
    for (const source of sources) {
      const isPrimitiveSource = isPrimitive(source);
      if (isPrimitiveSource) {
        target = source;
        isPrimitiveTarget = isPrimitiveSource;
      }
      else {
        if (isPrimitiveTarget) {
          assert(!isPrimitiveSource);
          target = empty(source);
          assert(!isPrimitive(target));
          isPrimitiveTarget = isPrimitiveSource;
        }
        assert(!isPrimitiveTarget && !isPrimitiveSource);
        assert(!isPrimitive(target) && !isPrimitive(source));
        const keys = ObjectKeys(source);
        for (let i = 0; i < keys.length; ++i) {
          void strategy(keys[i], target, source);
        }
      }
    }
    return target;
  }
}

function empty_<T extends object>(source: T): T {
  switch (type(source)) {
    case 'Array':
      return [] as T;
    case 'Object':
      return source instanceof Object ? {} : ObjectCreate(null);
    default:
      return source;
  }
}
