import { global } from './global';
import type { DeepImmutable, DeepRequired } from './type';
import { extend } from './assign';
import { concat } from './concat';
import { findIndex } from './equal';
import { causeAsyncException } from './exception';

const { Map, WeakSet, Error } = global;

export interface Observer<N extends unknown[], D, R> {
  monitor(namespace: [] | N, listener: Monitor<N, D>, options?: ObserverOptions): () => void;
  on(namespace: N, listener: Subscriber<N, D, R>, options?: ObserverOptions): () => void;
  off(namespace: [] | N, listener?: Subscriber<N, D, R>): void;
  once(namespace: N, listener: Subscriber<N, D, R>): () => void;
}
export interface ObserverOptions {
  once?: boolean;
}
export interface Publisher<N extends unknown[], D, R> {
  emit(this: Publisher<N, undefined, R>, namespace: N, data?: D, tracker?: (data: D, results: R[]) => void): void;
  emit(namespace: N, data: D, tracker?: (data: D, results: R[]) => void): void;
  reflect(this: Publisher<N, undefined, R>, namespace: N, data?: D): R[];
  reflect(namespace: N, data: D): R[];
}
export type Monitor<N extends unknown[], D> = (data: D, namespace: N) => unknown;
export type Subscriber<N extends unknown[], D, R> = (data: D, namespace: N) => R;

interface RegisterNode<N extends unknown[], D, R> {
  readonly parent: RegisterNode<N, D, R> | undefined;
  readonly children: Map<N[number], RegisterNode<N, D, R>>;
  readonly childrenNames: N[number][];
  readonly items: RegisterItem<N, D, R>[];
}
export type RegisterItem<N extends unknown[], D, R> = {
  readonly type: RegisterItemType.Monitor;
  readonly namespace: [] | N;
  readonly listener: Monitor<N, D>;
  readonly options: ObserverOptions;
 } | {
  readonly type: RegisterItemType.Subscriber;
  readonly namespace: N;
  readonly listener: Subscriber<N, D, R>;
  readonly options: ObserverOptions;
};
const enum RegisterItemType {
  Monitor = 'monitor',
  Subscriber = 'subscriber',
}

export interface ObservationOptions {
  readonly limit?: number;
}

export class Observation<N extends unknown[], D, R>
  implements Observer<N, D, R>, Publisher<N, D, R> {
  constructor(opts: ObservationOptions = {}) {
    void extend(this.settings, opts);
  }
  private readonly settings: DeepImmutable<DeepRequired<ObservationOptions>> = {
    limit: 10,
  };
  public monitor(namespace: [] | N, listener: Monitor<N, D>, { once = false }: ObserverOptions = {}): () => void {
    if (typeof listener !== 'function') throw new Error(`Spica: Observation: Invalid listener: ${listener}`);
    const off = () => this.off(namespace, listener, RegisterItemType.Monitor);
    const { items } = this.seekNode(namespace);
    if (isRegistered(items, RegisterItemType.Monitor, namespace, listener)) return off;
    if (items.length === this.settings.limit) throw new Error(`Spica: Observation: Exceeded max listener limit.`);
    void items.push({
      type: RegisterItemType.Monitor,
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
    const { items } = this.seekNode(namespace);
    if (isRegistered(items, RegisterItemType.Subscriber, namespace, listener)) return off;
    if (items.length === this.settings.limit) throw new Error(`Spica: Observation: Exceeded max listener limit.`);
    void items.push({
      type: RegisterItemType.Subscriber,
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
  public off(namespace: [] | N, listener?: Monitor<N, D> | Subscriber<N, D, R>, type: RegisterItemType = RegisterItemType.Subscriber): void {
    switch (typeof listener) {
      case 'function':
        return void this.seekNode(namespace).items
          .some(({ type: type_, listener: listener_ }, i, items) => {
            if (listener_ !== listener) return false;
            if (type_ !== type) return false;
            switch (i) {
              case 0:
                return items.shift(), true;
              case items.length - 1:
                return items.pop(), true;
              default:
                return items.splice(i, 1), true;
            }
          });
      case 'undefined': {
        const node = this.seekNode(namespace);
        for (let i = 0; i < node.childrenNames.length; ++i) {
          const name = node.childrenNames[i];
          void this.off([...namespace, name as never] as N);
          assert(node.children.has(name));
          const child = node.children.get(name)!;
          if (child.items.length + child.childrenNames.length > 0) continue;
          void node.children.delete(name);
          assert(findIndex(name, node.childrenNames) !== -1);
          void node.childrenNames.splice(findIndex(name, node.childrenNames), 1);
          void --i;
        }
        void concat(
          node.items,
          node.items.splice(0, Infinity)
            .filter(({ type }) => type === RegisterItemType.Monitor));
        return;
      }
      default:
        throw new Error(`Spica: Observation: Unreachable.`);
    }
  }
  public emit(this: Observation<N, void, R>, type: N, data?: D, tracker?: (data: D, results: R[]) => void): void
  public emit(namespace: N, data: D, tracker?: (data: D, results: R[]) => void): void
  public emit(namespace: N, data: D, tracker?: (data: D, results: R[]) => void): void {
    void this.drain(namespace, data, tracker);
  }
  public reflect(this: Observation<N, void, R>, type: N, data?: D): R[]
  public reflect(namespace: N, data: D): R[]
  public reflect(namespace: N, data: D): R[] {
    let results: R[] = [];
    void this.emit(namespace, data, (_, r) => results = r);
    assert(Array.isArray(results));
    return results;
  }
  private relaySources = new WeakSet<Observer<N, D, unknown>>();
  public relay(source: Observer<N, D, unknown>): () => void {
    if (this.relaySources.has(source)) return () => undefined;
    void this.relaySources.add(source);
    const unbind = source.monitor([] as unknown[] as N, (data, namespace) =>
      void this.emit(namespace, data));
    return () => (
      void this.relaySources.delete(source),
      unbind());
  }
  private drain(namespace: N, data: D, tracker?: (data: D, results: R[]) => void): void {
    const results: R[] = [];
    for (const { type, listener, options: { once } } of this.refsBelow(this.seekNode(namespace))) {
      if (type !== RegisterItemType.Subscriber) continue;
      if (once) {
        void this.off(namespace, listener);
      }
      try {
        const result: R = listener(data, namespace) as R;
        if (tracker) {
          results[results.length] = result;
        }
      }
      catch (reason) {
        void causeAsyncException(reason);
      }
    }
    for (const { type, listener, options: { once } } of this.refsAbove(this.seekNode(namespace))) {
      if (type !== RegisterItemType.Monitor) continue;
      if (once) {
        void this.off(namespace, listener, RegisterItemType.Monitor);
      }
      try {
        void listener(data, namespace);
      }
      catch (reason) {
        void causeAsyncException(reason);
      }
    }
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
    return this.refsBelow(this.seekNode(namespace));
  }
  private refsAbove({ parent, items }: RegisterNode<N, D, R>): RegisterItem<N, D, R>[] {
    items = items.slice();
    while (parent) {
      void concat(items, parent.items);
      parent = parent.parent;
    }
    return items;
  }
  private refsBelow({ childrenNames, children, items }: RegisterNode<N, D, R>): RegisterItem<N, D, R>[] {
    items = items.slice();
    for (let i = 0; i < childrenNames.length; ++i) {
      const name = childrenNames[i];
      assert(children.has(name));
      const below = this.refsBelow(children.get(name)!);
      void concat(items, below);
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
  private node: RegisterNode<N, D, R> = {
    parent: undefined,
    children: new Map(),
    childrenNames: [],
    items: []
  };
  private seekNode(namespace: [] | N): RegisterNode<N, D, R> {
    return (namespace as unknown[]).reduce<RegisterNode<N, D, R>>((node, name) => {
      const { children } = node;
      if (!children.has(name)) {
        void node.childrenNames.push(name);
        void children.set(name, {
          parent: node,
          children: new Map(),
          childrenNames: [],
          items: []
        });
      }
      return children.get(name)!;
    }, this.node);
  }
}

function isRegistered<N extends unknown[], D, R>(items: RegisterItem<N, D, R>[], type: RegisterItemType, namespace: N, listener: Monitor<N, D> | Subscriber<N, D, R>): boolean {
  return items.some(item =>
    item.type === type &&
    item.namespace.length === namespace.length &&
    item.namespace.every((ns, i) => ns === namespace[i]) &&
    item.listener === listener);
}
