export interface Collection<K, V> {
  has(key: K): boolean;
  get(key: K): V | undefined;
  set(key: K, value: V): this;
  delete(key: K): boolean;
}

export interface IterableCollection<K, V> extends Collection<K, V> {
  [Symbol.iterator](): Iterator<[K, V], undefined, undefined>;
}
