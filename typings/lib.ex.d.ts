interface String {
  split(separator: string | RegExp, limit?: number): string[];
}

interface Array<T> {
  split(separator: string | RegExp, limit?: number): T[];
}

interface PromiseLike<T> {
  _?: T;
  catch(cb: (reason: any) => any): Promise<T>;
}

declare const Promise: PromiseConstructorLike & {
  all<T>(ps: (T | Promise<T>)[]): Promise<T[]>;
  race<T>(ps: (T | Promise<T>)[]): Promise<T>;
  resolve(): Promise<void>;
  resolve<T>(val: T): Promise<T>;
};
interface Promise<T> extends PromiseLike<T> {
}

interface Map<K, V> {
  clear(): void;
  delete(key: K): boolean;
  forEach(callbackfn: (value: V, index: K, map: Map<K, V>) => void, thisArg?: any): void;
  get(key: K): V;
  has(key: K): boolean;
  set(key: K, value?: V): this;
  size: number;
}

interface MapConstructor {
  new (): Map<any, any>;
  new <K, V>(entries?: [K, V][]): Map<K, V>;
  prototype: Map<any, any>;
}
declare var Map: MapConstructor;

interface WeakMap<K, V> {
  clear(): void;
  delete(key: K): boolean;
  get(key: K): V;
  has(key: K): boolean;
  set(key: K, value?: V): this;
}

interface WeakMapConstructor {
  new (): WeakMap<any, any>;
  new <K, V>(entries?: [K, V][]): WeakMap<K, V>;
  prototype: WeakMap<any, any>;
}
declare var WeakMap: WeakMapConstructor;
