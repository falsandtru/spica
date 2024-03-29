export const {
  MAX_SAFE_INTEGER,
  MAX_VALUE,
  MIN_SAFE_INTEGER,
  MIN_VALUE,
  EPSILON,
  isFinite,
  isInteger,
  isNaN,
  isSafeInteger,
  parseFloat,
  parseInt,
} = Number;

export const {
  PI,
  abs,
  ceil,
  floor,
  max,
  min,
  random,
  round,
  sign,
  cos,
  tan,
  log,
  log2,
  log10,
  sqrt,
} = Math;

export const isArray: {
  <T>(arg: ArrayLike<T> | Iterable<T>): arg is T[];
  (arg: any): arg is any[];
} = Array.isArray;

export const hasOwnProperty = Object.prototype.hasOwnProperty.call.bind(Object.prototype.hasOwnProperty) as (target: unknown, prop: string | number | symbol) => boolean;
export const isPrototypeOf = Object.prototype.isPrototypeOf.call.bind(Object.prototype.isPrototypeOf) as (target: unknown, base: unknown) => boolean;
export const isEnumerable = Object.prototype.propertyIsEnumerable.call.bind(Object.prototype.propertyIsEnumerable) as (target: unknown, prop: string | number | symbol) => boolean;
export const toString = Object.prototype.toString.call.bind(Object.prototype.toString) as (target: unknown) => string;
export const ObjectAssign: {
  <T extends U, U extends object>(target: T, source: Partial<U>, ...sources: Partial<U>[]): T;
  <T extends U, U extends object>(target: Partial<U>, source1: T, source2: Partial<U>, ...sources: Partial<U>[]): T;
  <T extends object>(target: T, ...sources: Partial<T>[]): T;
  <T extends object>(target: Partial<T>, source1: T, source2: Partial<T>, ...sources: Partial<T>[]): T;
} = Object.assign;
export const ObjectCreate: {
  (o: null, properties?: PropertyDescriptorMap & ThisType<any>): object;
  <T extends object>(o: T, properties?: PropertyDescriptorMap & ThisType<any>): T;
} = Object.create;
export const ObjectGetPrototypeOf: (o: unknown) => object | null = Object.getPrototypeOf;
export const ObjectSetPrototypeOf: <T extends object>(o: T, proto: object | null) => T = Object.setPrototypeOf;
