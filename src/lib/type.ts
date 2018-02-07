type Falsy = undefined | false | 0 | '' | null | void;
type Function = (...args: any[]) => any;
type Class = new (...args: any[]) => any;

export type Not<T extends boolean> =
  T extends true ? false :
  T extends false ? true :
  never;
export type And<T, U> = T extends Falsy ? T : U;
export type Or<T, U> = T extends Falsy ? U : T;
export type Eq<T, U> = T extends U ? U extends T ? true : false : false;
export type If<S, T, U> = S extends Falsy ? U : T;
export type Case<T extends keyof U, U extends {}> = U[T];

export type Type<T> =
  T extends undefined ? 'undefined' :
  T extends boolean ? 'boolean' :
  T extends number ? 'number' :
  T extends string ? 'string' :
  T extends symbol ? 'symbol' :
  T extends Function ? 'function' :
  'object';
export type Call<T extends Function> = T extends (...args: any[]) => infer R ? R : never;
export type NonNullable<T> = Diff<T, null | undefined>;
export type Diff<T, U> = T extends U ? never : T;
export type Filter<T, U> = T extends U ? T : never;

export type DiffProps<T, U> = Pick<T, Diff<keyof T, keyof U>>;
export type FilterProps<T, U> = Pick<T, Filter<keyof T, keyof U>>;
type Compose<T, U> = Pick<T & U, keyof T | keyof U>;
export type OverwriteProps<T, U> = Compose<{ [P in Diff<keyof T, keyof U>]: T[P]; }, U>;

export type Partial<T> =
  T extends object
    ? { [P in keyof T]?: T[P]; }
    : T;
export type DeepPartial<T, U extends object | undefined = undefined> =
  T extends object
    ? { [P in keyof T]?: NonNullable<T[P]> extends NonNullable<U | Function | Class> ? T[P] : DeepPartial<T[P], U>; }
    : T;
type Purify<T extends string> = { [P in T]: P; }[T];
export type Required<T> =
  T extends object
    ? { [P in Purify<keyof T>]: NonNullable<T[P]>; }
    : T;
export type DeepRequired<T, U extends object | undefined = undefined> =
  T extends object
    ? { [P in Purify<keyof T>]: NonNullable<T[P]> extends NonNullable<U | Function | Class> ? NonNullable<T[P]> : DeepRequired<NonNullable<T[P]>, U>; }
    : T;
export type Readonly<T> =
  T extends object
    ? { readonly [P in keyof T]: T[P]; }
    : T;
export type DeepReadonly<T, U extends object | undefined = undefined> =
  T extends object
    ? { readonly [P in keyof T]: NonNullable<T[P]> extends NonNullable<U | Function | Class> ? T[P] : DeepReadonly<T[P], U>; }
    : T;

export function type(target: any): string {
  const type = (Object.prototype.toString.call(target) as string).split(' ').pop()!.slice(0, -1);
  if (typeof target !== 'object' && target instanceof Object === false || target === null) return type.toLowerCase();
  return type;
}
