type Falsy = undefined | false | 0 | '' | null | void;
type Unique = typeof Unique;
declare const Unique: unique symbol;

export type Not<T extends boolean> = T extends true ? false : true;
export type And<T, U> = T extends Falsy ? T : U;
export type Or<T, U> = T extends Falsy ? U : T;

export type IsNever<T> = [T] extends [never] ? true : false;
export type IsVoid<T> = [void] extends [T] ? Not<Or<IsAny<T>, IsUnknown<T>>> : false;
export type IsAny<T> = [T] extends [Unique] ? Not<IsNever<T>> : false;
export type IsUnknown<T> = [T] extends [Unique | {} | void | null] ? false : true;

export type Eq<T, U> =
  // Exclude never type from T and U.
  Or<IsNever<T>, IsNever<U>> extends true ? And<IsNever<T>, IsNever<U>> :
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

export type Prepend<T, U extends readonly unknown[]> =
  U extends unknown ?
  ((a: T, ...as: U) => void) extends ((...as: infer S) => void) ? S :
  never :
  never;
export type Append<T, U extends readonly unknown[]> =
  U extends unknown ?
  Concat<U, [T]> :
  never;
export type Split<T extends readonly unknown[]> =
  T extends unknown ?
  T extends readonly [] ? never :
  ((...as: T) => void) extends ((a: infer T1, ...as: infer T2) => void) ? [T1, T2] :
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
export type Concat<T extends readonly unknown[], U extends readonly unknown[]> =
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
type Idx<T, U extends readonly unknown[], V extends readonly void[]> =
  U extends readonly [] ? -1 :
  { 0: V['length']; 1: Idx<T, Tail<U>, Prepend<void, V>>; }[If<TEq<U[0], T>, 0, 1>];
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
  IsNever<T> extends true ? 'never' :
  IsAny<T> extends true ? 'any' :
  IsUnknown<T> extends true ? 'unknown' :
  IsVoid<T> extends true ? 'void' :
  T extends null ? 'null' :
  Type<T>;

export type Pick<T, K extends string | number | symbol> = { [P in Extract<keyof T, K>]: T[P]; };
export type Omit<T, K extends string | number | symbol> = { [P in Exclude<keyof T, K>]: T[P]; };
export type Structural<T, K extends number | string | symbol = number | string> = Pick<T, K>;
export type OverwriteStruct<T, U> = Pick<Omit<T, keyof U> & U, any>;

export type ExtractProp<T, V> =
  { [Q in { [P in keyof T]: T[P] extends never ? If<TEq<V, never>, P, never> : T[P] extends V ? P : never; }[keyof T]]: T[Q]; };
export type DeepExtractProp<T, V, E = never> =
  T extends E ? never :
  T extends V ? T :
  Or<IsAny<T>, IsUnknown<T>> extends true ? T :
  T extends readonly unknown[] | Function ? never :
  T extends object ? ExcludeProp<{ [Q in { [P in keyof T]: If<TEq<V, never>, T[P] extends never ? P : never, T[P] extends V | object ? T[P] extends E ? never : P : never>; }[keyof T]]: ExactExclude<DeepExtractProp<T[Q], V, E>, {}>; }, never> :
  never;
export type ExcludeProp<T, V> =
  { [Q in { [P in keyof T]: If<TEq<V, never>, T[P] extends never ? never : P, If<Includes<T[P], V>, never, P>>; }[keyof T]]: T[Q]; };
export type DeepExcludeProp<T, V, E = never> =
  T extends E ? T :
  T extends V ? never :
  T extends readonly unknown[] | Function ? T :
  Or<IsAny<T>, IsUnknown<T>> extends true ? T :
  T extends object ? ExcludeProp<{ [Q in { [P in keyof T]: If<TEq<V, never>, T[P] extends never ? P : P, If<Includes<T[P], V>, T[P] extends E ? P : never, P>>; }[keyof T]]: ExactExclude<DeepExcludeProp<T[Q], V, E>, {}>; }, never> :
  T;
export type RewriteProp<T, R extends [unknown, unknown]> =
  { [P in keyof T]: Rewrite<T[P], R>; };
export type DeepRewriteProp<T, R extends [unknown, unknown], E = never> =
  [T] extends [never] ? Rewrite<T, R> :
  T extends E ? T :
  true extends (R extends never ? never : T extends R[0] ? true : never) ? Rewrite<T, R> :
  Or<IsAny<T>, IsUnknown<T>> extends true ? T :
  T extends readonly unknown[] | Function ? T :
  T extends object ? ExcludeProp<{ [P in keyof T]: DeepRewriteProp<T[P], R, E>; }, never> :
  T;
type Includes<T, U> = true extends (T extends U ? true : never) ? true : false;

export type Partial<T> =
  Or<IsAny<T>, IsUnknown<T>> extends true ? T :
  { [P in keyof T]+?: T[P]; };
export type DeepPartial<T, E = readonly unknown[]> =
  Or<IsAny<T>, IsUnknown<T>> extends true ? T :
  T extends E | Function ? T :
  { [P in keyof T]+?: DeepPartial<T[P], E>; };
export type Required<T> =
  Or<IsAny<T>, IsUnknown<T>> extends true ? T :
  { [P in keyof T]-?: T[P]; };
export type DeepRequired<T, E = readonly unknown[]> =
  Or<IsAny<T>, IsUnknown<T>> extends true ? T :
  T extends E | Function ? T :
  { [P in keyof T]-?: DeepRequired<T[P], E>; };
export type Immutable<T> =
  Or<IsAny<T>, IsUnknown<T>> extends true ? T :
  T extends ReadonlySet<infer V> ? ReadonlySet<V> :
  T extends ReadonlyMap<infer K, infer V> ? ReadonlyMap<K, V> :
  T extends ReadonlyArray<infer V> ? TEq<T, V[]> extends true ? readonly V[] :
  { readonly [P in keyof T]: T[P]; } :
  { readonly [P in keyof T]: T[P]; };
export type DeepImmutable<T, E = never> =
  Or<IsAny<T>, IsUnknown<T>> extends true ? T :
  T extends E | Function ? T :
  T extends ReadonlySet<infer V> ? ReadonlySet<V> :
  T extends ReadonlyMap<infer K, infer V> ? ReadonlyMap<K, V> :
  T extends ReadonlyArray<infer V> ? TEq<T, V[]> extends true ? readonly V[] :
  { readonly [P in keyof T]: DeepImmutable<T[P], E>; } :
  { readonly [P in keyof T]: DeepImmutable<T[P], E>; };
export type Mutable<T> =
  Or<IsAny<T>, IsUnknown<T>> extends true ? T :
  T extends ReadonlySet<infer V> ? Set<V> :
  T extends ReadonlyMap<infer K, infer V> ? Map<K, V> :
  T extends ReadonlyArray<infer V> ? TEq<T, readonly V[]> extends true ? V[] :
  { -readonly [P in keyof T]: T[P]; } :
  { -readonly [P in keyof T]: T[P]; };
export type DeepMutable<T, E = never> =
  Or<IsAny<T>, IsUnknown<T>> extends true ? T :
  T extends E | Function ? T :
  T extends ReadonlySet<infer V> ? Set<V> :
  T extends ReadonlyMap<infer K, infer V> ? Map<K, V> :
  T extends ReadonlyArray<infer V> ? TEq<T, readonly V[]> extends true ? V[] :
  { -readonly [P in keyof T]: DeepMutable<T[P], E>; } :
  { -readonly [P in keyof T]: DeepMutable<T[P], E>; };

const toString = Object.prototype.toString.call.bind(Object.prototype.toString) as (target: unknown) => string;

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
      return toString(value).slice(8, -1);
  }
}

export function isType(value: unknown, type: 'undefined'): value is undefined;
export function isType(value: unknown, type: 'null'): value is null;
export function isType(value: unknown, type: 'boolean'): value is boolean;
export function isType(value: unknown, type: 'number'): value is number;
export function isType(value: unknown, type: 'bigint'): value is bigint;
export function isType(value: unknown, type: 'string'): value is string;
export function isType(value: unknown, type: 'symbol'): value is symbol;
export function isType(value: unknown, type: 'function'): value is Function;
export function isType(value: unknown, type: 'object'): value is object;
export function isType(value: unknown[], type: 'Array'): value is unknown[];
export function isType(value: unknown, type: 'Array'): value is readonly unknown[];
export function isType(value: unknown, name: string): boolean {
  switch (name) {
    case 'function':
      return typeof value === 'function';
    case 'object':
      return value !== null
          && typeof value === 'object';
    default:
      return type(value) === name;
  }
}

export function isPrimitive(value: unknown): value is undefined | null | boolean | number | bigint | string | symbol {
  switch (typeof value) {
    case 'undefined':
    case 'boolean':
    case 'number':
    case 'bigint':
    case 'string':
    case 'symbol':
      return true;
    default:
      return value === null;
  }
}
