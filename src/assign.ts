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
          return target[prop] = clone(empty(source[prop]), source[prop]);
        default:
          return target[prop] = source[prop];
      }
    default:
      return target[prop] = source[prop];
  }
});

export const overwrite = template((prop, target, source) => {
  switch (type(source[prop])) {
    case 'Array':
      return target[prop] = source[prop];
    case 'Object':
      switch (type(target[prop])) {
        case 'Object':
          return overwrite(target[prop], source[prop]);
        default:
          return target[prop] = overwrite(empty(source[prop]), source[prop]);
      }
    default:
      return target[prop] = source[prop];
  }
});

export const extend = template((prop, target, source) => {
  switch (type(source[prop])) {
    case 'undefined':
      return;
    case 'Array':
      return target[prop] = source[prop];
    case 'Object':
      switch (type(target[prop])) {
        case 'Object':
          return extend(target[prop], source[prop]);
        default:
          return target[prop] = extend(empty(source[prop]), source[prop]);
      }
    default:
      return target[prop] = source[prop];
  }
});

export const merge = template((prop, target, source) => {
  switch (type(source[prop])) {
    case 'undefined':
      return;
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
          return merge(target[prop], source[prop]);
        default:
          return target[prop] = merge(empty(source[prop]), source[prop]);
      }
    default:
      return target[prop] = source[prop];
  }
});

export const inherit = template((prop, target, source) => {
  switch (type(source[prop])) {
    case 'undefined':
      return;
    case 'Array':
      return target[prop] = source[prop].slice();
    case 'Object':
      switch (type(target[prop])) {
        case 'Object':
          return hasOwnProperty(target, prop)
            ? inherit(target[prop], source[prop])
            : target[prop] = inherit(ObjectCreate(target[prop]), source[prop]);
        default:
          return target[prop] = ObjectCreate(source[prop]);
      }
    default:
      return target[prop] = source[prop];
  }
});

export function template(strategy: (prop: string, target: object, source: object) => void) {
  return walk;

  function walk<T extends U, U extends object>(target: Partial<U>, source1: T, source2: Partial<U>, ...sources: Partial<U>[]): T;
  function walk<T extends U, U extends object>(target: T, source: Partial<U>, ...sources: Partial<U>[]): T;
  function walk<T extends object>(target: Partial<T>, source1: T, source2: Partial<T>, ...sources: Partial<T>[]): T;
  function walk<T extends object>(target: T, ...sources: Partial<T>[]): T;
  function walk<T extends object>(target: T, ...sources: T[]): T {
    assert(!isPrimitive(target));
    if (isPrimitive(target)) return target;
    for (let i = 0; i < sources.length; ++i) {
      const source = sources[i];
      if (source === target) continue;
      assert(!isPrimitive(source));
      if (isPrimitive(source)) continue;
      assert(!isPrimitive(target) && !isPrimitive(source));
      const keys = ObjectKeys(source);
      for (let i = 0; i < keys.length; ++i) {
        strategy(keys[i], target, source);
      }
    }
    return target;
  }
}

function empty(source: object): object {
  assert(type(source) === 'Object');
  return source instanceof Object ? {} : ObjectCreate(null);
}
