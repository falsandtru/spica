import { type } from './type';
import { concat } from './concat';

export const assign = template((key, target, source) =>
  target[key] = source[key]);

export const clone = template((key, target, source) => {
  switch (type(source[key])) {
    case 'Array':
      return target[key] = clone([], source[key]);
    case 'Object':
      switch (type(target[key])) {
        case 'Object':
          return target[key] = clone(source[key] instanceof Object ? {} : Object.create(null), source[key]);
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
          return target[key] = extend(source[key] instanceof Object ? {} : Object.create(null), source[key]);
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
          return target[key] = merge(source[key] instanceof Object ? {} : Object.create(null), source[key]);
      }
    default:
      return target[key] = source[key];
  }
});

export function template(strategy: (key: string, target: object, source: object) => void) {
  return walk;

  function walk<T extends U, U extends object>(target: T, ...sources: Partial<U>[]): T;
  function walk<T extends U, U extends object>(target: object, source: T, ...sources: Partial<U>[]): T;
  function walk<T extends object>(target: T, ...sources: Partial<T>[]): T;
  function walk<T extends object>(target: object, source: T, ...sources: Partial<T>[]): T;
  function walk<T extends U, U extends object>(target: T, ...sources: Partial<U>[]): T {
    if (target === undefined || target === null) throw new TypeError(`Spica: assign: Cannot walk on ${target}.`);
    for (const source of sources) if (source) {
      for (const key of Object.keys(source)) {
        void strategy(key, target, source);
      }
    }
    return target;
  }
}
