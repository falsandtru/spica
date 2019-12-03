import './global';
import { type, isPrimitive } from './type';
import { concat } from './concat';

const { Object: Obj } = global;

export const assign = template((key, target, source) =>
  target[key] = source[key]);

export const clone = template((key, target, source) => {
  switch (type(source[key])) {
    case 'Array':
      return target[key] = clone([], source[key]);
    case 'Object':
      switch (type(target[key])) {
        case 'Object':
          return target[key] = clone(source[key] instanceof Obj ? {} : Obj.create(null), source[key]);
        default:
          return target[key] = source[key];
      }
    default:
      return target[key] = source[key];
  }
});

export const extend = template((key, target, source) => {
  switch (type(source[key])) {
    case 'Array':
      return target[key] = extend([], source[key]);
    case 'Object':
      switch (type(target[key])) {
        case 'Object':
          return target[key] = extend(target[key], source[key]);
        default:
          return target[key] = extend(source[key] instanceof Obj ? {} : Obj.create(null), source[key]);
      }
    default:
      return target[key] = source[key];
  }
});

export const merge = template((key, target, source) => {
  switch (type(source[key])) {
    case 'Array':
      switch (type(target[key])) {
        case 'Array':
          return target[key] = concat(target[key], source[key]);
        default:
          return target[key] = merge([], source[key]);
      }
    case 'Object':
      switch (type(target[key])) {
        case 'Object':
          return target[key] = merge(target[key], source[key]);
        default:
          return target[key] = merge(source[key] instanceof Obj ? {} : Obj.create(null), source[key]);
      }
    default:
      return target[key] = source[key];
  }
});

export function template(
  strategy: (key: string, target: object, source: object) => void,
  empty = empty_) {
  return walk;

  function walk<T extends U, U extends object>(target: Partial<U>, source1: T, source2: Partial<U>, ...sources: Partial<U>[]): T;
  function walk<T extends U, U extends object>(target: T, source: Partial<U>, ...sources: Partial<U>[]): T;
  function walk<T extends object>(target: Partial<T>, source1: T, source2: Partial<T>, ...sources: Partial<T>[]): T;
  function walk<T extends object>(target: T, source: Partial<T>, ...sources: Partial<T>[]): T;
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
        for (const key of Obj.keys(source)) {
          void strategy(key, target, source);
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
      return source instanceof Obj ? {} : Obj.create(null);
    default:
      return source;
  }
}
