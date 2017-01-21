import { WeakMapLike } from 'spica';

export class AttrMap<C, K, V> {
  constructor(
    entries: Iterable<[C, K, V]> = [],
    private readonly KeyMap: new <K, V>(entries?: Iterable<[K, V]>) => WeakMapLike<K, V> = WeakMap,
    private readonly ValueMap: new <K, V>(entries?: Iterable<[K, V]>) => WeakMapLike<K, V> = Map
  ) {
    void Array.from(entries)
      .forEach(([c, k, v]) =>
        void this.set(c, k, v));
  }
  private readonly store = new this.KeyMap<C, WeakMapLike<K, V>>();
  public get(ctx: C, key: K): V | undefined {
    return this.store.get(ctx) && this.store.get(ctx)!.get(key)!;
  }
  public set(ctx: C, key: K, val: V): this {
    const store = this.store.has(ctx)
      ? this.store.get(ctx)!
      : this.store.set(ctx, new this.ValueMap<K, V>()).get(ctx)!;
    void store.set(key, val);
    return this;
  }
  public has(ctx: C): boolean
  public has(ctx: C, key: K): boolean
  public has(ctx: C, key?: K): boolean {
    return arguments.length === 1
      ? this.store.has(ctx)
      : this.store.has(ctx) && this.store.get(ctx)!.has(key!);
  }
  public delete(ctx: C): boolean
  public delete(ctx: C, key: K): boolean
  public delete(ctx: C, key?: K): boolean {
    return arguments.length === 1
      ? this.store.delete(ctx)
      : this.store.has(ctx)
        ? this.store.get(ctx)!.delete(key!)
        : false;
  }
}
