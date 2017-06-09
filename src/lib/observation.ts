import { Observer, ObserverOptions, Publisher, Monitor, Subscriber } from '../../index.d';
import { concat } from './concat';
import { causeAsyncException } from './exception';

interface RegisterNode<T extends ReadonlyArray<any>, D, R> {
  parent: RegisterNode<T, D, R> | undefined;
  children: Map<keyof T, RegisterNode<T, D, R>>;
  childrenNames: (keyof T)[];
  items: RegisterItem<T, D, R>[];
}
export type RegisterItem<T extends ReadonlyArray<any>, D, R> = {
  type: RegisterItemType.Monitor;
  namespace: T;
  listener: Monitor<T, D>;
  options: ObserverOptions;
 } | {
  type: RegisterItemType.Subscriber;
  namespace: T;
  listener: Subscriber<T, D, R>;
  options: ObserverOptions;
};
export type RegisterItemType = RegisterItemType.Monitor | RegisterItemType.Subscriber;
export namespace RegisterItemType {
  export type Monitor = typeof monitor;
  export const monitor = 'monitor';
  export type Subscriber = typeof subscriber;
  export const subscriber = 'subscriber';
}

export class Observation<T extends ReadonlyArray<any>, D, R>
  implements Observer<T, D, R>, Publisher<T, D, R> {
  public monitor(namespace: T, listener: Monitor<T, D>, { once = false }: ObserverOptions = {}): () => void {
    void throwTypeErrorIfInvalidListener(listener, namespace);
    const { items } = this.seekNode_(namespace);
    if (isRegistered(items, RegisterItemType.monitor, namespace, listener)) return () => void 0;
    void items.push({
      type: RegisterItemType.monitor,
      namespace,
      listener,
      options: {
        once
      },
    });
    return () => this.off(namespace, listener, RegisterItemType.monitor);
  }
  public on(namespace: T, listener: Subscriber<T, D, R>, { once = false }: ObserverOptions = {}): () => void {
    void throwTypeErrorIfInvalidListener(listener, namespace);
    const { items } = this.seekNode_(namespace);
    if (isRegistered(items, RegisterItemType.subscriber, namespace, listener)) return () => void 0;
    void items.push({
      type: RegisterItemType.subscriber,
      namespace,
      listener,
      options: {
        once
      },
    });
    return () => this.off(namespace, listener);
  }
  public once(namespace: T, listener: Subscriber<T, D, R>): () => void {
    void throwTypeErrorIfInvalidListener(listener, namespace);
    return this.on(namespace, listener, { once: true });
  }
  public off(namespace: T, listener?: Monitor<T, D> | Subscriber<T, D, R>, type: RegisterItemType = RegisterItemType.subscriber): void {
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
            void this.off(<T><any>namespace.concat([name]));
            const child = node.children.get(name);
            if (!child) return;
            if (child.items.length + child.childrenNames.length > 0) return;
            void node.children.delete(name);
            assert(node.childrenNames.findIndex(value => value === name || (name !== name && value !== value)) !== -1);
            void node.childrenNames.splice(node.childrenNames.findIndex(value => value === name || (name !== name && value !== value)), 1);
          });
        node.items = node.items
          .filter(({ type }) => type === RegisterItemType.monitor);
        return;
      }
      default:
        throw throwTypeErrorIfInvalidListener(listener, namespace);
    }
  }
  public emit(namespace: T, data: D, tracker?: (data: D, results: R[]) => void): void
  public emit(this: Observation<T, void, R>, type: T, data?: D, tracker?: (data: D, results: R[]) => void): void
  public emit(namespace: T, data: D, tracker?: (data: D, results: R[]) => void): void {
    void this.drain_(namespace, data, tracker);
  }
  public reflect(namespace: T, data: D): R[]
  public reflect(this: Observation<T, void, R>, type: T, data?: D): R[]
  public reflect(namespace: T, data: D): R[] {
    let results: R[] = [];
    void this.emit(namespace, <D>data, (_, r) => results = r);
    assert(Array.isArray(results));
    return results;
  }
  private relaySources = new WeakSet<Observer<T, D, any>>();
  public relay(source: Observer<T, D, any>): () => void {
    if (this.relaySources.has(source)) return () => void 0;
    void this.relaySources.add(source);
    return source.monitor(<T><any>[], (data, namespace) => (
      void this.relaySources.delete(source),
      void this.emit(namespace, data)));
  }
  private drain_(namespace: T, data: D, tracker?: (data: D, results: R[]) => void): void {
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
          if (reason !== void 0 && reason !== null) {
            void causeAsyncException(reason);
          }
        }
      }, void 0);
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
          if (reason !== void 0 && reason !== null) {
            void causeAsyncException(reason);
          }
        }
      }, void 0);
    if (tracker) {
      try {
        void tracker(data, results);
      }
      catch (reason) {
        void causeAsyncException(reason);
      }
    }
  }
  public refs(namespace: never[] | T): RegisterItem<T, D, R>[] {
    return this.refsBelow_(this.seekNode_(namespace));
  }
  private refsAbove_({parent, items}: RegisterNode<T, D, R>): RegisterItem<T, D, R>[] {
    items = concat([], items);
    while (parent) {
      items = concat(items, parent.items);
      parent = parent.parent;
    }
    return items;
  }
  private refsBelow_({childrenNames, children, items}: RegisterNode<T, D, R>): RegisterItem<T, D, R>[] {
    items = concat([], items);
    for (let i = 0; i < childrenNames.length; ++i) {
      const name = childrenNames[i];
      const below = this.refsBelow_(children.get(name)!);
      items = concat(items, below);
      if (below.length === 0) {
        void children.delete(name);
        void childrenNames.splice(childrenNames.findIndex(value => value === name || (name !== name && value !== value)), 1);
        void --i;
      }
    }
    return items;
  }
  private node_: RegisterNode<T, D, R> = {
    parent: void 0,
    children: new Map(),
    childrenNames: [],
    items: []
  };
  private seekNode_(types: never[] | T): RegisterNode<T, D, R> {
    let node = this.node_;
    for (const type of types) {
      const {children} = node;
      if (!children.has(type)) {
        void node.childrenNames.push(type);
        children.set(type, {
          parent: node,
          children: new Map(),
          childrenNames: [],
          items: <RegisterItem<T, D, R>[]>[]
        });
      }
      node = children.get(type)!;
    }
    return node;
  }
}

function isRegistered<T extends ReadonlyArray<any>, D, R>(items: RegisterItem<T, D, R>[], type: RegisterItemType, namespace: T, listener: Monitor<T, D> | Subscriber<T, D, R>): boolean {
  return items.some(({ type: t, namespace: n, listener: l }) =>
    t === type &&
    n.length === namespace.length &&
    n.every((_, i) => n[i] === namespace[i]) &&
    l === listener);
}

function throwTypeErrorIfInvalidListener<T extends ReadonlyArray<any>, D, R>(listener: Monitor<T, D> | Subscriber<T, D, R> | undefined, types: T): void {
  switch (typeof listener) {
    case 'function':
      return;
    default:
      throw new TypeError(`Spica: Observation: Invalid listener.\n\t${types} ${listener}`);
  }
}
