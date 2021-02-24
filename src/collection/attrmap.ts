import { Map, WeakMap } from '../global';
import { Collection } from '../collection';

export class AttrMap<C, K, V> {
  constructor(
    entries: Iterable<[C, K, V]> = [],
    private readonly KeyMap: new <K, V>(entries?: Iterable<[K, V]>) => Collection<K, V> = WeakMap,
    private readonly ValueMap: new <K, V>(entries?: Iterable<[K, V]>) => Collection<K, V> = Map
  ) {
    for (const [c, k, v] of entries) {
      this.set(c, k, v);
    }
  }
  private readonly memory = new this.KeyMap<C, Collection<K, V>>();
  public get(ctx: C, key: K): V | undefined {
    return this.memory.get(ctx)?.get(key);
  }
  public set(ctx: C, key: K, val: V): this {
    this.memory.get(ctx)?.set(key, val) || this.memory.set(ctx, new this.ValueMap([[key, val]]));
    return this;
  }
  public has(ctx: C): boolean
  public has(ctx: C, key: K): boolean
  public has(ctx: C, key?: K): boolean {
    return arguments.length === 1
      ? this.memory.has(ctx)
      : this.memory.get(ctx)?.has(key!) ?? false;
  }
  public delete(ctx: C): boolean
  public delete(ctx: C, key: K): boolean
  public delete(ctx: C, key?: K): boolean {
    return arguments.length === 1
      ? this.memory.delete(ctx)
      : this.memory.get(ctx)?.delete(key!) ?? false;
  }
}
