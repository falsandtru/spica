// WARNING: Must not contain assertions here and in dependency modules!

type NonNull = {};

export interface Dict<K, V> {
  add?(key: K, value: V): NonNull;
  set(key: K, value: V): this;
  get(key: K): V | undefined;
  has(key: K): boolean;
  delete(key: K): boolean;
}

export interface IterableDict<K, V> extends Dict<K, V> {
  readonly size: number;
  [Symbol.iterator](): Iterator<[K, V], undefined, undefined>;
}
