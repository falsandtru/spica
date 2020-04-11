export const {
  NaN,
  isFinite,
  isInteger,
  isNaN,
  isSafeInteger,
  parseFloat,
  parseInt,
} = Number;

//export const SymbolAsyncIterator: typeof Symbol.asyncIterator = Symbol.asyncIterator;
export const SymbolFor = Symbol.for;
//export const SymbolHasInstance: typeof Symbol.hasInstance = Symbol.hasInstance;
//export const SymbolIsConcatSpreadable: typeof Symbol.isConcatSpreadable = Symbol.isConcatSpreadable;
//export const SymbolIterator: typeof Symbol.iterator = Symbol.iterator;
export const SymbolKeyFor = Symbol.keyFor;
//export const SymbolMatch: typeof Symbol.match = Symbol.match;
//export const SymbolReplace: typeof Symbol.replace = Symbol.replace;
//export const SymbolSearch: typeof Symbol.search = Symbol.search;
//export const SymbolSpecies: typeof Symbol.species = Symbol.species;
//export const SymbolSplit: typeof Symbol.split = Symbol.split;
//export const SymbolToPrimitive: typeof Symbol.toPrimitive = Symbol.toPrimitive;
//export const SymbolToStringTag: typeof Symbol.toStringTag = Symbol.toStringTag;
//export const SymbolUnscopables: typeof Symbol.unscopables = Symbol.unscopables;

export const hasOwnProperty = Object.prototype.hasOwnProperty.call.bind(Object.prototype.hasOwnProperty) as (target: unknown, prop: string | number | symbol) => boolean;
export const isPrototypeOf = Object.prototype.isPrototypeOf.call.bind(Object.prototype.isPrototypeOf) as (target: unknown, base: unknown) => boolean;
export const isEnumerable = Object.prototype.propertyIsEnumerable.call.bind(Object.prototype.propertyIsEnumerable) as (target: unknown, prop: string | number | symbol) => boolean;
export const toString = Object.prototype.toString.call.bind(Object.prototype.toString) as (target: unknown) => string;
export const ObjectAssign = Object.assign;
export const ObjectCreate: {
  (o: null, properties?: PropertyDescriptorMap & ThisType<any>): {};
  <T extends object>(o: T, properties?: PropertyDescriptorMap & ThisType<any>): T;
} = Object.create;
export const ObjectDefineProperties: <T extends object>(o: T, properties: PropertyDescriptorMap & ThisType<any>) => T = Object.defineProperties;
export const ObjectDefineProperty: <T extends object>(o: T, p: string | number | symbol, attributes: PropertyDescriptor & ThisType<any>) => T = Object.defineProperty;
export const ObjectEntries = Object.entries;
export const ObjectFreeze = Object.freeze;
export const ObjectGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
export const ObjectGetOwnPropertyDescriptors = Object.getOwnPropertyDescriptors;
export const ObjectGetOwnPropertyNames = Object.getOwnPropertyNames;
export const ObjectGetOwnPropertySymbols = Object.getOwnPropertySymbols;
export const ObjectGetPrototypeOf = Object.getPrototypeOf;
export const ObjectIs = Object.is;
export const isExtensible = Object.isExtensible;
export const isFrozen = Object.isFrozen;
export const isSealed = Object.isSealed;
export const ObjectKeys = Object.keys;
export const ObjectPreventExtensions = Object.preventExtensions;
export const ObjectSeal = Object.seal;
export const ObjectSetPrototypeOf: <T extends object>(o: T, proto: object | null) => T = Object.setPrototypeOf;
export const ObjectValues = Object.values;

export const isArray = Array.isArray as {
  (arg: any[]): arg is any[];
  (arg: readonly any[]): arg is readonly any[];
  <T>(arg: Iterable<T>): arg is T[];
  (arg: any): arg is any[];
};
