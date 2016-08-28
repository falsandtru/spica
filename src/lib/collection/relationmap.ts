export class RelationMap<S extends Object, T extends Object, V> {
  private store = new WeakMap<S, WeakMap<T, V>>();
  public get(source: S, target: T): V {
    return this.store.get(source)! && this.store.get(source)!.get(target)!;
  }
  public set(source: S, target: T, val: V): this {
    const store = this.store.has(source)
      ? this.store.get(source)!
      : this.store.set(source, new WeakMap<T, V>()).get(source)!;
    void store.set(target, val);
    return this;
  }
  public has(source: S, target: T): boolean {
    return this.store.has(source) && this.store.get(source)!.has(target);
  }
  public delete(source: S, target?: T): boolean {
    return target === void 0
      ? this.store.delete(source)
      : this.store.has(source)
        ? this.store.get(source)!.delete(target)
        : false;
  }
}
