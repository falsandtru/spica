export interface Dict<K, V> {
  has(key: K): boolean;
  get(key: K): V | undefined;
  set(key: K, value: V): this;
  delete(key: K): boolean;
}

export interface IterableDict<K, V> extends Dict<K, V> {
  readonly size: number;
  [Symbol.iterator](): Iterator<[K, V], undefined, undefined>;
}
