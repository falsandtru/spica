import { type } from './type';

export const assign = template((key, target, source) =>
  target[key] = source[key]);

export const clone = template((key, target, source): void => {
  switch (type(source[key])) {
    case 'Array':
      return target[key] = clone([], source[key]);
    case 'Object':
      return target[key] = type(source[key]) === 'Object'
        ? clone(source[key] instanceof Object ? {} : Object.create(null), source[key])
        : source[key];
    default:
      return target[key] = source[key];
  }
});

export const extend = template((key, target, source): void => {
  switch (type(source[key])) {
    case 'Array':
      return target[key] = extend([], source[key]);
    case 'Object':
      switch (type(target[key])) {
        case 'Object':
          return target[key] = type(source[key]) === 'Object'
            ? extend(target[key], source[key])
            : source[key];
        default:
          return target[key] = type(source[key]) === 'Object'
            ? extend(source[key] instanceof Object ? {} : Object.create(null), source[key])
            : source[key];
      }
    default:
      return target[key] = source[key];
  }
});

function template(strategy: (key: string, target: object, source: object) => void) {
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
