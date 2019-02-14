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
export type StrictExclude<T, U> = T extends StrictExtract<T, U> ? never : T;

export type indexof<T, V extends valueof<T>> = { [P in keyof T]: If<TEq<T[P], V>, P, never>; }[keyof T];
export type valueof<T, K extends string | number | symbol = T extends { [n: number]: any; length: number; } ? number : string | number> = T[Extract<keyof T, K>];

export type Type<T> =
  T extends undefined ? 'undefined' :
  T extends boolean ? 'boolean' :
  T extends number ? 'number' :
  T extends bigint ? 'bigint' :
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
  T extends readonly any[] | Function ? never :
  T extends object ? ExcludeProp<{ [Q in { [P in keyof T]: If<TEq<V, never>, T[P] extends never ? P : never, T[P] extends V | object ? T[P] extends E ? never : P : never>; }[keyof T]]: StrictExclude<DeepExtractProp<T[Q], V, E>, {}>; }, never> :
  never;
export type ExcludeProp<T, V> =
  { [Q in { [P in keyof T]: If<TEq<V, never>, T[P] extends never ? never : P, If<Includes<T[P], V>, never, P>>; }[keyof T]]: T[Q]; };
export type DeepExcludeProp<T, V, E extends object | undefined | null = never> =
  T extends E ? T :
  T extends V ? never :
  T extends readonly any[] | Function ? T :
  T extends object ? ExcludeProp<{ [Q in { [P in keyof T]: If<TEq<V, never>, T[P] extends never ? P : P, If<Includes<T[P], V>, T[P] extends E ? P : never, P>>; }[keyof T]]: StrictExclude<DeepExcludeProp<T[Q], V, E>, {}>; }, never> :
  T;
export type RewriteProp<T, R extends [any, any]> =
  { [P in keyof T]: Rewrite<T[P], R>; };
export type DeepRewriteProp<T, R extends [any, any], E extends object | undefined | null = never> =
  [T] extends [never] ? Rewrite<T, R> :
  T extends E ? T :
  true extends (R extends never ? never : T extends R[0] ? true : never) ? Rewrite<T, R> :
  T extends readonly any[] | Function ? T :
  T extends object ? ExcludeProp<{ [P in keyof T]: DeepRewriteProp<T[P], R, E>; }, never> :
  T;
type Includes<T, U> = true extends (T extends U ? true : never) ? true : false;

export type Partial<T> =
  { [P in keyof T]+?: T[P]; };
export type DeepPartial<T, E extends object | undefined | null = readonly any[]> =
  T extends E | Function ? T :
  { [P in keyof T]+?: DeepPartial<T[P], E>; };
export type Required<T> =
  { [P in keyof T]-?: T[P]; };
export type DeepRequired<T, E extends object | undefined | null = readonly any[]> =
  T extends E | Function ? T :
  { [P in keyof T]-?: DeepRequired<T[P], E>; };
export type Immutable<T> =
  T extends ReadonlySet<infer V> ? ReadonlySet<V> :
  T extends ReadonlyMap<infer K, infer V> ? ReadonlyMap<K, V> :
  T extends ReadonlyArray<infer V> ? TEq<T, V[]> extends true ? readonly V[] :
  { readonly [P in keyof T]: T[P]; } :
  { readonly [P in keyof T]: T[P]; };
export type DeepImmutable<T, E extends object | undefined | null = never> =
  T extends E | Function ? T :
  T extends ReadonlySet<infer V> ? ReadonlySet<V> :
  T extends ReadonlyMap<infer K, infer V> ? ReadonlyMap<K, V> :
  T extends ReadonlyArray<infer V> ? TEq<T, V[]> extends true ? readonly V[] :
  { readonly [P in keyof T]: DeepImmutable<T[P], E>; } :
  { readonly [P in keyof T]: DeepImmutable<T[P], E>; };
export type Mutable<T> =
  T extends ReadonlySet<infer V> ? Set<V> :
  T extends ReadonlyMap<infer K, infer V> ? Map<K, V> :
  T extends ReadonlyArray<infer V> ? TEq<T, readonly V[]> extends true ? V[] :
  { -readonly [P in keyof T]: T[P]; } :
  { -readonly [P in keyof T]: T[P]; };
export type DeepMutable<T, E extends object | undefined | null = never> =
  T extends E | Function ? T :
  T extends ReadonlySet<infer V> ? Set<V> :
  T extends ReadonlyMap<infer K, infer V> ? Map<K, V> :
  T extends ReadonlyArray<infer V> ? TEq<T, readonly V[]> extends true ? V[] :
  { -readonly [P in keyof T]: DeepMutable<T[P], E>; } :
  { -readonly [P in keyof T]: DeepMutable<T[P], E>; };

export function type(target: any): string {
  const type = (Object.prototype.toString.call(target)).split(' ').pop()!.slice(0, -1);
  if (target === null || typeof target !== 'object' && target instanceof Object === false) return type.toLowerCase();
  return type;
}

export function isObject(target: any): target is object {
  return target !== null
      && (typeof target ==='object' || target instanceof Object);
}
