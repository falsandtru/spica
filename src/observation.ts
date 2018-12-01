import { DeepRequired } from './type';
import { extend } from './assign';
import { concat } from './concat';
import { findIndex } from './equal';
import { causeAsyncException } from './exception';

export interface Observer<N extends any[], D, R> {
  monitor(namespace: [] | N, listener: Monitor<N, D>, options?: ObserverOptions): () => void;
  on(namespace: N, listener: Subscriber<N, D, R>, options?: ObserverOptions): () => void;
  off(namespace: [] | N, listener?: Subscriber<N, D, R>): void;
  once(namespace: N, listener: Subscriber<N, D, R>): () => void;
}
export interface ObserverOptions {
  once?: boolean;
}
export interface Publisher<N extends any[], D, R> {
  emit(this: Publisher<N, void, R>, namespace: N, data?: D, tracker?: (data: D, results: R[]) => void): void;
  emit(namespace: N, data: D, tracker?: (data: D, results: R[]) => void): void;
  reflect(this: Publisher<N, void, R>, namespace: N, data?: D): R[];
  reflect(namespace: N, data: D): R[];
}
export type Monitor<N extends any[], D> = (data: D, namespace: N) => any;
export type Subscriber<N extends any[], D, R> = (data: D, namespace: N) => R;

interface RegisterNode<N extends any[], D, R> {
  parent: RegisterNode<N, D, R> | undefined;
  children: Map<N[keyof N], RegisterNode<N, D, R>>;
  childrenNames: N[keyof N][];
  items: RegisterItem<N, D, R>[];
}
export type RegisterItem<N extends any[], D, R> = {
  type: RegisterItemType.Monitor;
  namespace: [] | N;
  listener: Monitor<N, D>;
  options: ObserverOptions;
 } | {
  type: RegisterItemType.Subscriber;
  namespace: N;
  listener: Subscriber<N, D, R>;
  options: ObserverOptions;
};
export type RegisterItemType = RegisterItemType.Monitor | RegisterItemType.Subscriber;
export namespace RegisterItemType {
  export type Monitor = typeof monitor;
  export const monitor = 'monitor';
  export type Subscriber = typeof subscriber;
  export const subscriber = 'subscriber';
}

export interface ObservationOptions {
  readonly limit?: number;
}

export class Observation<N extends any[], D, R>
  implements Observer<N, D, R>, Publisher<N, D, R> {
  constructor(opts: ObservationOptions = {}) {
    void Object.freeze(extend(this.settings, opts));
  }
  private readonly settings: DeepRequired<ObservationOptions> = {
    limit: 10,
  };
  public monitor(namespace: [] | N, listener: Monitor<N, D>, { once = false }: ObserverOptions = {}): () => void {
    if (typeof listener !== 'function') throw new Error(`Spica: Observation: Invalid listener: ${listener}`);
    const off = () => this.off(namespace, listener, RegisterItemType.monitor);
    const { items } = this.seekNode_(namespace);
    if (isRegistered(items, RegisterItemType.monitor, namespace, listener)) return off;
    if (items.length === this.settings.limit) throw new Error(`Spica: Observation: Exceeded max listener limit.`);
    void items.push({
      type: RegisterItemType.monitor,
      namespace,
      listener,
      options: {
        once
      },
    });
    return off;
  }
  public on(namespace: N, listener: Subscriber<N, D, R>, { once = false }: ObserverOptions = {}): () => void {
    if (typeof listener !== 'function') throw new Error(`Spica: Observation: Invalid listener: ${listener}`);
    const off = () => this.off(namespace, listener);
    const { items } = this.seekNode_(namespace);
    if (isRegistered(items, RegisterItemType.subscriber, namespace, listener)) return off;
    if (items.length === this.settings.limit) throw new Error(`Spica: Observation: Exceeded max listener limit.`);
    void items.push({
      type: RegisterItemType.subscriber,
      namespace,
      listener,
      options: {
        once
      },
    });
    return off;
  }
  public once(namespace: N, listener: Subscriber<N, D, R>): () => void {
    return this.on(namespace, listener, { once: true });
  }
  public off(namespace: [] | N, listener?: Monitor<N, D> | Subscriber<N, D, R>, type: RegisterItemType = RegisterItemType.subscriber): void {
    switch (typeof listener) {
      case 'function':
        return void this.seekNode_(namespace).items
          .some(({ type: type_, listener: listener_ }, i, items) => {
            if (listener_ !== listener) return false;
            if (type_ !== type) return false;
            switch (i) {
              case 0:
                return !void items.shift();
              case items.length - 1:
                return !void items.pop();
              default:
                return !void items.splice(i, 1);
            }
          });
      case 'undefined': {
        const node = this.seekNode_(namespace);
        void node.childrenNames.slice()
          .forEach(name => {
            void this.off(namespace.concat([name as never]) as N);
            const child = node.children.get(name);
            if (!child) return;
            if (child.items.length + child.childrenNames.length > 0) return;
            void node.children.delete(name);
            assert(findIndex(name, node.childrenNames) !== -1);
            void node.childrenNames.splice(findIndex(name, node.childrenNames), 1);
          });
        node.items = node.items
          .filter(({ type }) => type === RegisterItemType.monitor);
        return;
      }
      default:
        throw new Error(`Spica: Observation: Unreachable.`);
    }
  }
  public emit(namespace: N, data: D, tracker?: (data: D, results: R[]) => void): void
  public emit(this: Observation<N, void, R>, type: N, data?: D, tracker?: (data: D, results: R[]) => void): void
  public emit(namespace: N, data: D, tracker?: (data: D, results: R[]) => void): void {
    void this.drain_(namespace, data, tracker);
  }
  public reflect(namespace: N, data: D): R[]
  public reflect(this: Observation<N, void, R>, type: N, data?: D): R[]
  public reflect(namespace: N, data: D): R[] {
    let results: R[] = [];
    void this.emit(namespace, data, (_, r) => results = r);
    assert(Array.isArray(results));
    return results;
  }
  private relaySources = new WeakSet<Observer<N, D, any>>();
  public relay(source: Observer<N, D, any>): () => void {
    if (this.relaySources.has(source)) return () => undefined;
    void this.relaySources.add(source);
    const unbind = source.monitor([] as any[] as N, (data, namespace) =>
      void this.emit(namespace, data));
    return () => (
      void this.relaySources.delete(source),
      unbind());
  }
  private drain_(namespace: N, data: D, tracker?: (data: D, results: R[]) => void): void {
    const results: R[] = [];
    void this.refsBelow_(this.seekNode_(namespace))
      .reduce<void>((_, { type, listener, options: { once } }) => {
        if (type !== RegisterItemType.subscriber) return;
        if (once) {
          void this.off(namespace, listener);
        }
        try {
          const result: R = listener(data, namespace);
          if (tracker) {
            results[results.length] = result;
          }
        }
        catch (reason) {
          void causeAsyncException(reason);
        }
      }, undefined);
    void this.refsAbove_(this.seekNode_(namespace))
      .reduce<void>((_, { type, listener, options: { once } }) => {
        if (type !== RegisterItemType.monitor) return;
        if (once) {
          void this.off(namespace, listener, RegisterItemType.monitor);
        }
        try {
          void listener(data, namespace);
        }
        catch (reason) {
          void causeAsyncException(reason);
        }
      }, undefined);
    if (tracker) {
      try {
        void tracker(data, results);
      }
      catch (reason) {
        void causeAsyncException(reason);
      }
    }
  }
  public refs(namespace: [] | N): RegisterItem<N, D, R>[] {
    return this.refsBelow_(this.seekNode_(namespace));
  }
  private refsAbove_({parent, items}: RegisterNode<N, D, R>): RegisterItem<N, D, R>[] {
    items = concat([], items);
    while (parent) {
      items = concat(items, parent.items);
      parent = parent.parent;
    }
    return items;
  }
  private refsBelow_({childrenNames, children, items}: RegisterNode<N, D, R>): RegisterItem<N, D, R>[] {
    items = concat([], items);
    for (let i = 0; i < childrenNames.length; ++i) {
      const name = childrenNames[i];
      const below = this.refsBelow_(children.get(name)!);
      items = concat(items, below);
      if (below.length === 0) {
        void children.delete(name);
        void childrenNames.splice(
          findIndex(name, childrenNames),
          1);
        void --i;
      }
    }
    return items;
  }
  private node_: RegisterNode<N, D, R> = {
    parent: undefined,
    children: new Map(),
    childrenNames: [],
    items: []
  };
  private seekNode_(namespace: [] | N): RegisterNode<N, D, R> {
    let node = this.node_;
    for (const name of namespace) {
      const {children} = node;
      if (!children.has(name)) {
        void node.childrenNames.push(name);
        children.set(name, {
          parent: node,
          children: new Map(),
          childrenNames: [],
          items: []
        });
      }
      node = children.get(name)!;
    }
    return node;
  }
}

function isRegistered<N extends any[], D, R>(items: RegisterItem<N, D, R>[], type: RegisterItemType, namespace: N, listener: Monitor<N, D> | Subscriber<N, D, R>): boolean {
  return items.some(item =>
    item.type === type &&
    item.namespace.length === namespace.length &&
    item.namespace.every((ns, i) => ns === namespace[i]) &&
    item.listener === listener);
}
