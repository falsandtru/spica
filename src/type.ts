type Falsy = undefined | false | 0 | '' | null | void;
declare const Unique: unique symbol
type Unique = typeof Unique;

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
export type TEq<T, U> =
  Or<IsAny<T>, IsAny<U>> extends true ? And<IsAny<T>, IsAny<U>> :
  [T] extends [U] ? [U] extends [T] ? true : false : false;
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

export type IsAny<T> = [T] extends [Unique] ? true : false;
export type IsUnknown<T> = [T] extends [Unique | {} | void | null] ? false : true;

export type Prepend<Elm, T extends readonly unknown[]> =
  T extends unknown ?
  ((arg: Elm, ...rest: T) => void) extends ((...args: infer T2) => void) ? T2 :
  never :
  never;
export type Append<Elm, T extends readonly [] | readonly [unknown, ...readonly unknown[]]> =
  T extends unknown ?
  Concat<T, [Elm]> :
  never;
export type Split<T extends readonly unknown[]> =
  T extends unknown ?
  T extends readonly [] ? never :
  ((...rest: T) => void) extends ((arg: infer T1, ...args: infer T2) => void) ? [T1, T2] :
  never :
  never;
export type Head<T extends unknown[]> =
  T extends [] ? never :
  Split<T>[0];
export type Tail<T extends readonly unknown[]> =
  T extends readonly [] ? never :
  Split<T>[1];
export type Init<T extends readonly unknown[]> =
  number extends T['length'] ? T :
  T extends readonly [] ? never :
  init<T, []>;
type init<T extends readonly unknown[], U extends readonly unknown[]> =
  { 0: U; 1: Prepend<T[0], Init<Tail<T>>>; }[T extends readonly [unknown] ? 0 : 1];
export type Last<T extends readonly unknown[]> =
  T extends readonly [] ? never :
  Tail<T> extends T ? T[0] :
  { 0: T[0]; 1: Last<Tail<T>>; }[T extends readonly [unknown] ? 0 : 1]
export type Inits<as extends readonly unknown[]> =
  number extends as['length'] ? never :
  as extends readonly [] ? never :
  [] | inits<as>;
type inits<as extends readonly unknown[]> = {
  0: never;
  1: [Split<as>[0]] | Prepend<Split<as>[0], inits<Split<as>[1]>>;
}[as extends readonly [unknown, ...readonly unknown[]] ? 1 : 0];
export type Tails<as extends readonly unknown[]> =
  number extends as['length'] ? never :
  as extends readonly [] ? never :
  tails<as> | [];
type tails<as extends readonly unknown[]> = {
  0: never;
  1: as | tails<Split<as>[1]>;
}[as extends readonly [unknown, ...readonly unknown[]] ? 1 : 0];
export type Concat<T extends readonly [] | readonly [unknown, ...readonly unknown[]], U extends readonly unknown[]> =
  { 0: U; 1: Concat<Init<T>, Prepend<Last<T>, U>>; }[T extends readonly [] ? 0 : 1];
export type Reverse<T extends readonly unknown[]> =
  number extends T['length'] ? T :
  Rev<T, []>;
type Rev<T extends readonly unknown[], U extends readonly unknown[]> =
  { 0: U; 1: Rev<Tail<T>, Prepend<T[0], U>>; }[T extends readonly [] ? 0 : 1];
export type Member<T, U extends readonly unknown[]> = Index<T, U> extends -1 ? false : true;
export type Index<T, U extends readonly unknown[]> =
  number extends U['length'] ? If<TEq<U[0], T>, number, -1> :
  Idx<T, U, []>;
type Idx<T, U extends readonly unknown[], V extends readonly unknown[]> =
  U extends readonly [] ? -1 :
  { 0: V['length']; 1: Idx<T, Tail<U>, Prepend<T, V>>; }[If<TEq<U[0], T>, 0, 1>];
export type AtLeast<N extends number, T> = AtLeastRec<N, T, T[], []>;
type AtLeastRec<L, Elm, T extends readonly unknown[], C extends readonly unknown[]> = {
  0: T;
  1: AtLeastRec<L, Elm, Prepend<Elm, T>, Prepend<unknown, C>>;
}[C['length'] extends L ? 0 : 1];

export type Rewrite<T, R extends [unknown, unknown]> =
  [T] extends [never]
    ? true extends (R extends never ? never : R[0] extends never ? true : never)
      ? R extends (R extends never ? never : R[0] extends never ? R : never) ? R[1] : never
      : T :
  T extends never ? never :
  true extends (R extends never ? never : T extends R[0] ? true : never)
    ? R extends (R extends never ? never : T extends R[0] ? R : never) ? R[1] : never
    : T;
export type ExactRewrite<T, R extends [unknown, unknown]> =
  [T] extends [never] ? Rewrite<T, R> :
  T extends never ? never :
  true extends (R extends never ? never : If<Eq<T, R[0]>, true, never>)
    ? R extends (R extends never ? never : If<Eq<T, R[0]>, R, never>) ? R[1] : never
    : T;

export type ExactExtract<T, U> = T extends U ? U extends T ? T : never : never;
export type ExactExclude<T, U> = T extends ExactExtract<T, U> ? never : T;

export type indexof<T, V extends valueof<T>> =
  T extends readonly unknown[] ? Index<V, T> :
  { [P in keyof T]: If<TEq<T[P], V>, P, never>; }[keyof T];
export type valueof<T, K extends string | number | symbol = T extends { [n: number]: unknown; length: number; } ? number : string | number> = T[Extract<keyof T, K>];

export type Type<T> =
  T extends void ? null extends void ? 'object' | 'undefined' : 'undefined' :
  T extends undefined ? 'undefined' :
  T extends boolean ? 'boolean' :
  T extends number ? 'number' :
  T extends bigint ? 'bigint' :
  T extends string ? 'string' :
  T extends symbol ? 'symbol' :
  T extends Function ? 'function' :
  'object';
export type StrictType<T> =
  T extends void ? null extends void ? 'null' | 'undefined' : 'undefined' :
  T extends null ? 'null' :
  Type<T>;

export type DiffStruct<T, U> = Pick<T, Exclude<keyof T, keyof U>>;
export type OverwriteStruct<T, U> = Unify<{ [P in Exclude<keyof T, keyof U>]: T[P]; }, U>;
type Unify<T, U> = Pick<T & U, keyof T | keyof U>;

export type ExtractProp<T, V> =
  { [Q in { [P in keyof T]: T[P] extends never ? If<TEq<V, never>, P, never> : T[P] extends V ? P : never; }[keyof T]]: T[Q]; };
export type DeepExtractProp<T, V, E = never> =
  T extends E ? never :
  T extends V ? T :
  T extends readonly unknown[] | Function ? never :
  T extends object ? ExcludeProp<{ [Q in { [P in keyof T]: If<TEq<V, never>, T[P] extends never ? P : never, T[P] extends V | object ? T[P] extends E ? never : P : never>; }[keyof T]]: ExactExclude<DeepExtractProp<T[Q], V, E>, {}>; }, never> :
  never;
export type ExcludeProp<T, V> =
  { [Q in { [P in keyof T]: If<TEq<V, never>, T[P] extends never ? never : P, If<Includes<T[P], V>, never, P>>; }[keyof T]]: T[Q]; };
export type DeepExcludeProp<T, V, E = never> =
  T extends E ? T :
  T extends V ? never :
  T extends readonly unknown[] | Function ? T :
  T extends object ? ExcludeProp<{ [Q in { [P in keyof T]: If<TEq<V, never>, T[P] extends never ? P : P, If<Includes<T[P], V>, T[P] extends E ? P : never, P>>; }[keyof T]]: ExactExclude<DeepExcludeProp<T[Q], V, E>, {}>; }, never> :
  T;
export type RewriteProp<T, R extends [unknown, unknown]> =
  { [P in keyof T]: Rewrite<T[P], R>; };
export type DeepRewriteProp<T, R extends [unknown, unknown], E = never> =
  [T] extends [never] ? Rewrite<T, R> :
  T extends E ? T :
  true extends (R extends never ? never : T extends R[0] ? true : never) ? Rewrite<T, R> :
  T extends readonly unknown[] | Function ? T :
  T extends object ? ExcludeProp<{ [P in keyof T]: DeepRewriteProp<T[P], R, E>; }, never> :
  T;
type Includes<T, U> = true extends (T extends U ? true : never) ? true : false;

export type Partial<T> =
  { [P in keyof T]+?: T[P]; };
export type DeepPartial<T, E = readonly unknown[]> =
  T extends E | Function ? T :
  { [P in keyof T]+?: DeepPartial<T[P], E>; };
export type Required<T> =
  { [P in keyof T]-?: T[P]; };
export type DeepRequired<T, E = readonly unknown[]> =
  T extends E | Function ? T :
  { [P in keyof T]-?: DeepRequired<T[P], E>; };
export type Immutable<T> =
  T extends ReadonlySet<infer V> ? ReadonlySet<V> :
  T extends ReadonlyMap<infer K, infer V> ? ReadonlyMap<K, V> :
  T extends ReadonlyArray<infer V> ? TEq<T, V[]> extends true ? readonly V[] :
  { readonly [P in keyof T]: T[P]; } :
  { readonly [P in keyof T]: T[P]; };
export type DeepImmutable<T, E = never> =
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
export type DeepMutable<T, E = never> =
  T extends E | Function ? T :
  T extends ReadonlySet<infer V> ? Set<V> :
  T extends ReadonlyMap<infer K, infer V> ? Map<K, V> :
  T extends ReadonlyArray<infer V> ? TEq<T, readonly V[]> extends true ? V[] :
  { -readonly [P in keyof T]: DeepMutable<T[P], E>; } :
  { -readonly [P in keyof T]: DeepMutable<T[P], E>; };

const toString = Object.prototype.toString;

export function type(value: unknown): string {
  const t = value == null ? value : typeof value;
  switch (t) {
    case undefined:
    case null:
      return `${value}`;
    case 'boolean':
    case 'number':
    case 'bigint':
    case 'string':
    case 'symbol':
      return t;
    default:
      return toString.call(value).slice(8, -1);
  }
}

export function isPrimitive(value: unknown): value is undefined | null | boolean | number | bigint | string | symbol {
  switch (type(value)) {
    case 'undefined':
    case 'null':
    case 'boolean':
    case 'number':
    case 'bigint':
    case 'string':
    case 'symbol':
      return true;
    default:
      return false;
  }
}
