type Falsy = undefined | false | 0 | '' | null | void;

export type Not<T extends boolean> = T extends true ? false : true;
export type And<T, U> = T extends Falsy ? T : U;
export type Or<T, U> = T extends Falsy ? U : T;
export type Eq<T, U> =
  // Exclude never type from T and U.
  [T] extends [never]
    ? [U] extends [never] ? true : false
    : [U] extends [never] ? false :
  // T and U below are a type except never.
  // Distribute U.
  U extends never
    ? never : // Never reach here.
  // Compare distributed T and U.
  T extends U ? U extends T ? true : false : false;
export type TEq<T, U> = [T] extends [U] ? [U] extends [T] ? true : false : false;
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

export type Rewrite<T, R extends [any, any]> =
  [T] extends [never]
    ? true extends (R extends never ? never : R[0] extends never ? true : never)
      ? R extends (R extends never ? never : R[0] extends never ? R : never) ? R[1] : never
      : T :
  T extends never ? never :
  true extends (R extends never ? never : T extends R[0] ? true : never)
    ? R extends (R extends never ? never : T extends R[0] ? R : never) ? R[1] : never
    : T;
export type StrictRewrite<T, R extends [any, any]> =
  [T] extends [never] ? Rewrite<T, R> :
  T extends never ? never :
  true extends (R extends never ? never : If<Eq<T, R[0]>, true, never>)
    ? R extends (R extends never ? never : If<Eq<T, R[0]>, R, never>) ? R[1] : never
    : T;

export type StrictExtract<T, U> = T extends U ? U extends T ? T : never : never;
export type StrictExclude<T, U> = T extends U ? T extends StrictExtract<T, U> ? never : T : T;

export type indexof<T, V extends valueof<T>> = { [P in keyof T]: If<TEq<T[P], V>, P, never>; }[keyof T];
export type valueof<T, K extends string | number | symbol = T extends { [n: number]: any; length: number; } ? number : string> = T[Extract<keyof T, K>];

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
export type OverwriteStruct<T, U> = Unify<{ [P in Exclude<keyof T, keyof U>]: T[P]; }, U>;
type Unify<T, U> = Pick<T & U, keyof T | keyof U>;

export type ExtractProp<T, V> =
  { [Q in { [P in keyof T]: T[P] extends never ? If<TEq<V, never>, P, never> : T[P] extends V ? P : never; }[keyof T]]: T[Q]; };
export type DeepExtractProp<T, V, E extends object | undefined | null = never> =
  T extends E ? never :
  T extends V ? T :
  T extends any[] ? never :
  T extends object ? ExcludeProp<{ [Q in { [P in keyof T]: If<TEq<V, never>, T[P] extends never ? P : never, T[P] extends V | object ? T[P] extends E ? never : P : never>; }[keyof T]]: StrictExclude<DeepExtractProp<T[Q], V, E>, {}>; }, never> :
  never;
export type ExcludeProp<T, V> =
  { [Q in { [P in keyof T]: If<TEq<V, never>, T[P] extends never ? never : P, If<Includes<T[P], V>, never, P>>; }[keyof T]]: T[Q]; };
export type DeepExcludeProp<T, V, E extends object | undefined | null = never> =
  T extends E ? T :
  T extends V ? never :
  T extends any[] ? T :
  T extends object ? ExcludeProp<{ [Q in { [P in keyof T]: If<TEq<V, never>, T[P] extends never ? never : P, If<Includes<T[P], V>, T[P] extends E ? P : never, P>>; }[keyof T]]: StrictExclude<DeepExcludeProp<T[Q], V, E>, {}>; }, never> :
  T;
export type RewriteProp<T, R extends [any, any]> =
  { [P in keyof T]: Rewrite<T[P], R>; };
export type DeepRewriteProp<T, R extends [any, any], E extends object | undefined | null = never> =
  T extends E ? T :
  T extends any[] ? T :
  T extends object ? ExcludeProp<{ [P in keyof T]: DeepRewriteProp<Rewrite<T[P], R>, R, E>; }, never> :
  T;
type Includes<T, U> = true extends (T extends U ? true : never) ? true : false;

export type Partial<T> =
  T extends (infer U)[] ? T :
  T extends object ? { [P in keyof T]+?: T[P]; } :
  T;
export type DeepPartial<T, E extends object | undefined | null = any[]> =
  T extends E ? T :
  T extends object ? { [P in keyof T]+?: NonNullable<T[P]> extends NonNullable<E | Function> ? T[P] : DeepPartial<T[P], E>; } :
  T;
export type Required<T> =
  T extends (infer U)[] ? T :
  T extends object ? { [P in keyof T]-?: T[P]; } :
  T;
export type DeepRequired<T, E extends object | undefined | null = any[]> =
  T extends E ? T :
  T extends object ? { [P in keyof T]-?: NonNullable<T[P]> extends NonNullable<E | Function> ? T[P] : DeepRequired<T[P], E>; } :
  T;
export type Readonly<T> =
  T extends (infer U)[] ? ReadonlyArray<U> :
  T extends object ? { readonly [P in keyof T]: T[P]; } :
  T;
export type DeepReadonly<T, E extends object | undefined | null = never> =
  T extends E ? T :
  T extends (infer U)[] ? ReadonlyArray<U> :
  T extends object ? { readonly [P in keyof T]: NonNullable<T[P]> extends NonNullable<E | Function> ? T[P] : DeepReadonly<T[P], E>; } :
  T;

export function type(target: any): string {
  const type = (Object.prototype.toString.call(target) as string).split(' ').pop()!.slice(0, -1);
  if (typeof target !== 'object' && target instanceof Object === false || target === null) return type.toLowerCase();
  return type;
}
