export interface Collection<K, V> {
  has(key: K): boolean;
  get(key: K): V | undefined;
  set(key: K, value: V): this;
  delete(key: K): boolean;
}

export function generative
  <T extends Collection<any, any>>
  (collection: T, factory: (key: T extends { get(key: infer U): unknown; } ? U : never) => T extends { set(key: unknown, value: infer U): unknown; } ? U : never)
  : T {
  void Object.defineProperty(collection, 'get', {
    get: () => function (this: T, key: any) {
      if (!this.has(key)) {
        void this.set(key, factory(key));
      }
      return this.constructor.prototype.get.call(this, key);
    }
  })
  return collection;
}
