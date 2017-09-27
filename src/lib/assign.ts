import { type } from './type';

export const assign = template((key, target, source) =>
  target[key] = source[key]);

export const clone = template((key, target, source): void => {
  switch (type(source[key])) {
    case 'Array':
      return target[key] = clone([], source[key]);
    case 'Object':
      return target[key] = clone({}, source[key]);
    default:
      return target[key] = source[key];
  }
});

export const extend = template((key, target, source): void => {
  switch (type(source[key])) {
    case 'Array':
      switch (type(target[key])) {
        case 'Array':
          return target[key] = extend([], source[key]);
        default:
          return target[key] = source[key];
      }
    case 'Object':
      switch (type(target[key])) {
        case 'Object':
          return target[key] = extend(target[key], source[key]);
        default:
          return target[key] = source[key];
      }
    default:
      return target[key] = source[key];
  }
});

function template(strategy: (key: string, target: any, source: any) => void) {
  return walk;

  function walk<T extends U, U extends object>(target: T, ...sources: Partial<U>[]): T;
  function walk<T extends U, U extends object>(target: object, source: T, ...sources: Partial<U>[]): T;
  function walk<T extends object>(target: T, ...sources: Partial<T>[]): T;
  function walk<T extends object>(target: object, source: T, ...sources: Partial<T>[]): T;
  function walk<T extends U, U extends object>(target: T, ...sources: Partial<U>[]): T {
    if (target === undefined || target === null) {
      throw new TypeError(`Spica: assign: Cannot walk on ${target}.`);
    }

    for (const source of sources) {
      if (source === undefined || source === null) {
        continue;
      }

      for (const key of Object.keys(Object(source))) {
        const desc = Object.getOwnPropertyDescriptor(Object(source), key);
        if (desc !== undefined && desc.enumerable) {
          void strategy(key, Object(target), Object(source));
        }
      }
    }
    return <T>Object(target);
  }
}
