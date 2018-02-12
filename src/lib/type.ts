type Falsy = undefined | false | 0 | '' | null | void;
type Function = (...args: any[]) => any;
type Constructor = new (...args: any[]) => any;

export type Not<T extends boolean> =
  T extends true ? false :
  T extends false ? true :
  never;
export type And<T, U> = T extends Falsy ? T : U;
export type Or<T, U> = T extends Falsy ? U : T;
export type Eq<T, U> = T extends U ? U extends T ? true : false : false;
export type If<S, T, U> = S extends Falsy ? U : T;
export type Case<T extends keyof U, U extends {}> = U[T];

export type DEq<T extends valueof<NondeterminateTypeMap>, U extends valueof<NondeterminateTypeMap>> =
  Determine<T> extends undefined ? undefined :
  Determine<U> extends undefined ? undefined :
  Eq<T, U>;
type Determine<T extends valueof<NondeterminateTypeMap>> =
  valueof<NondeterminateTypeMap> extends T ? undefined :
  T;
interface NondeterminateTypeMap {
  boolean: boolean;
}

export type keyof<T, V = any> = { [P in keyof T]: If<Eq<T[P], V>, P, never>; }[keyof T];
export type valueof<T, K = string> = { [P in keyof T]: P extends K ? T[P] : never; }[keyof T];
export type Type<T> =
  T extends undefined ? 'undefined' :
  T extends boolean ? 'boolean' :
  T extends number ? 'number' :
  T extends string ? 'string' :
  T extends symbol ? 'symbol' :
  T extends Function ? 'function' :
  T extends void ? null extends void ? 'object' | 'undefined' : 'undefined' :
  'object';

export type DiffStruct<T, U> = Pick<T, Exclude<keyof T, keyof U>>;
type Compose<T, U> = Pick<T & U, keyof T | keyof U>;
export type OverwriteStruct<T, U> = Compose<{ [P in Exclude<keyof T, keyof U>]: T[P]; }, U>;

export type ExtractProp<T, V> = { [Q in { [P in keyof T]: T[P] extends V ? P : never; }[keyof T]]: T[Q]; };
export type DeepExtractProp<T, V> =
  T extends object
    ? { [Q in { [P in keyof T]: T[P] extends V ? P : never; }[keyof T]]: DeepExtractProp<T[Q], V>; }
    : T;
export type ExcludeProp<T, V> = { [Q in { [P in keyof T]: T[P] extends V ? never : P; }[keyof T]]: T[Q]; };
export type DeepExcludeProp<T, V> =
  T extends object
    ? { [Q in { [P in keyof T]: T[P] extends V ? never : P; }[keyof T]]: DeepExcludeProp<T[Q], V>; }
    : T;

export type Partial<T> =
  T extends object
    ? { [P in keyof T]?: T[P]; }
    : T;
export type DeepPartial<T, E extends object | undefined = undefined> =
  T extends object
    ? { [P in keyof T]?: NonNullable<T[P]> extends NonNullable<E | Function | Constructor> ? T[P] : DeepPartial<T[P], E>; }
    : T;
type Purify<T extends string> = { [P in T]: P; }[T];
export type Required<T> =
  T extends object
    ? { [P in Purify<keyof T>]: NonNullable<T[P]>; }
    : T;
export type DeepRequired<T, E extends object | undefined = undefined> =
  T extends object
    ? { [P in Purify<keyof T>]: NonNullable<T[P]> extends NonNullable<E | Function | Constructor> ? NonNullable<T[P]> : DeepRequired<NonNullable<T[P]>, E>; }
    : T;
export type Readonly<T> =
  T extends object
    ? { readonly [P in keyof T]: T[P]; }
    : T;
export type DeepReadonly<T, E extends object | undefined = undefined> =
  T extends object
    ? { readonly [P in keyof T]: NonNullable<T[P]> extends NonNullable<E | Function | Constructor> ? T[P] : DeepReadonly<T[P], E>; }
    : T;

export function type(target: any): string {
  const type = (Object.prototype.toString.call(target) as string).split(' ').pop()!.slice(0, -1);
  if (typeof target !== 'object' && target instanceof Object === false || target === null) return type.toLowerCase();
  return type;
}
