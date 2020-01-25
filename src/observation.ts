import { global } from './global';
import type { DeepImmutable, DeepRequired } from './type';
import { extend } from './assign';
import { concat } from './concat';
import { findIndex } from './equal';
import { causeAsyncException } from './exception';

const { Map, WeakSet, Error } = global;

export interface Observer<N extends readonly unknown[], D, R> {
  monitor(namespace: readonly [] | N, listener: Monitor<N, D>, options?: ObserverOptions): () => void;
  on(namespace: N, listener: Subscriber<N, D, R>, options?: ObserverOptions): () => void;
  off(namespace: readonly [] | N, listener?: Subscriber<N, D, R>): void;
  once(namespace: N, listener: Subscriber<N, D, R>): () => void;
}
export interface ObserverOptions {
  once?: boolean;
}
export interface Publisher<N extends readonly unknown[], D, R> {
  emit(this: Publisher<N, undefined, R>, namespace: N, data?: D, tracker?: (data: D, results: R[]) => void): void;
  emit(namespace: N, data: D, tracker?: (data: D, results: R[]) => void): void;
  reflect(this: Publisher<N, undefined, R>, namespace: N, data?: D): R[];
  reflect(namespace: N, data: D): R[];
}
export type Monitor<N extends readonly unknown[], D> = (data: D, namespace: N) => unknown;
export type Subscriber<N extends readonly unknown[], D, R> = (data: D, namespace: N) => R;

class RegisterNode<N extends readonly unknown[], D, R> {
  constructor(public readonly parent: RegisterNode<N, D, R> | undefined) {
  }
  public readonly children: Map<N[number], RegisterNode<N, D, R>> = new Map();
  public readonly childrenNames: N[number][] = [];
  public readonly monitors: MonitorItem<N, D>[] = [];
  public readonly subscribers: SubscriberItem<N, D, R>[] = [];
}
export type RegisterItem<N extends readonly unknown[], D, R> =
  | MonitorItem<N, D>
  | SubscriberItem<N, D, R>;
type MonitorItem<N extends readonly unknown[], D> = {
  readonly type: RegisterItemType.Monitor;
  readonly namespace: readonly [] | N;
  readonly listener: Monitor<N, D>;
  readonly options: ObserverOptions;
 };
type SubscriberItem<N extends readonly unknown[], D, R> = {
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

export class Observation<N extends readonly unknown[], D, R>
  implements Observer<N, D, R>, Publisher<N, D, R> {
  constructor(opts: ObservationOptions = {}) {
    void extend(this.settings, opts);
  }
  private readonly settings: DeepImmutable<DeepRequired<ObservationOptions>> = {
    limit: 10,
  };
  public monitor(namespace: readonly [] | N, listener: Monitor<N, D>, { once = false }: ObserverOptions = {}): () => void {
    if (typeof listener !== 'function') throw new Error(`Spica: Observation: Invalid listener: ${listener}`);
    const off = () => this.off(namespace, listener, RegisterItemType.Monitor);
    const { monitors } = this.seekNode(namespace);
    if (isRegistered(monitors, RegisterItemType.Monitor, namespace, listener)) return off;
    if (monitors.length === this.settings.limit) throw new Error(`Spica: Observation: Exceeded max listener limit.`);
    void monitors.push({
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
    const { subscribers } = this.seekNode(namespace);
    if (isRegistered(subscribers, RegisterItemType.Subscriber, namespace, listener)) return off;
    if (subscribers.length === this.settings.limit) throw new Error(`Spica: Observation: Exceeded max listener limit.`);
    void subscribers.push({
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
  public off(namespace: readonly [] | N, listener?: Monitor<N, D> | Subscriber<N, D, R>, type: RegisterItemType = RegisterItemType.Subscriber): void {
    switch (typeof listener) {
      case 'function': {
        const items = this.seekItems(namespace, type);
        const i = items.findIndex(item => item.listener === listener);
        switch (i) {
          case -1:
            return;
          case 0:
            return void items.shift();
          case items.length - 1:
            return void items.pop();
          default:
            return void items.splice(i, 1);
        }
      }
      case 'undefined': {
        const node = this.seekNode(namespace);
        for (let i = 0; i < node.childrenNames.length; ++i) {
          const name = node.childrenNames[i];
          void this.off([...namespace, name] as const as N);
          assert(node.children.has(name));
          const child = node.children.get(name)!;
          if (child.monitors.length + child.subscribers.length + child.childrenNames.length > 0) continue;
          void node.children.delete(name);
          assert(findIndex(name, node.childrenNames) !== -1);
          void node.childrenNames.splice(findIndex(name, node.childrenNames), 1);
          void --i;
        }
        if (node.subscribers.length > 0) {
          node.subscribers.length = 0;
        }
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
    const unbind = source.monitor([], (data, namespace) =>
      void this.emit(namespace, data));
    return () => (
      void this.relaySources.delete(source),
      unbind());
  }
  private drain(namespace: N, data: D, tracker?: (data: D, results: R[]) => void): void {
    const node = this.seekNode(namespace);
    const results: R[] = [];
    for (const { listener, options: { once } } of this.refsBelow(node, RegisterItemType.Subscriber)[0]) {
      if (once) {
        void this.off(namespace, listener);
      }
      try {
        const result = listener(data, namespace) as R;
        tracker && void results.push(result);
      }
      catch (reason) {
        void causeAsyncException(reason);
      }
    }
    for (const { listener, options: { once } } of this.refsAbove(node, RegisterItemType.Monitor)) {
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
  public refs(namespace: readonly [] | N): RegisterItem<N, D, R>[] {
    const node = this.seekNode(namespace);
    return concat(this.refsBelow(node, RegisterItemType.Monitor)[0], this.refsBelow(node, RegisterItemType.Subscriber)[0]);
  }
  private refsAbove({ parent, monitors, subscribers }: RegisterNode<N, D, R>, type: RegisterItemType): RegisterItem<N, D, R>[] {
    const items = type === RegisterItemType.Monitor
      ? monitors.slice()
      : subscribers.slice();
    while (parent) {
      type === RegisterItemType.Monitor
        ? void concat(items as typeof monitors, parent.monitors)
        : void concat(items as typeof subscribers, parent.subscribers);
      parent = parent.parent;
    }
    return items;
  }
  private refsBelow({ childrenNames, children, monitors, subscribers }: RegisterNode<N, D, R>, type: RegisterItemType): readonly [RegisterItem<N, D, R>[], number] {
    const items = type === RegisterItemType.Monitor
      ? monitors.slice()
      : subscribers.slice();
    let count = 0;
    for (let i = 0; i < childrenNames.length; ++i) {
      const name = childrenNames[i];
      assert(children.has(name));
      const [below, cnt] = this.refsBelow(children.get(name)!, type);
      count += cnt;
      void concat(items, below);
      if (cnt === 0) {
        void children.delete(name);
        void childrenNames.splice(
          findIndex(name, childrenNames),
          1);
        void --i;
      }
    }
    return [items, monitors.length + subscribers.length + count];
  }
  private node: RegisterNode<N, D, R> = new RegisterNode(undefined);
  private seekNode(namespace: readonly [] | N): RegisterNode<N, D, R> {
    return (namespace as N).reduce<RegisterNode<N, D, R>>((node, name) => {
      const { children } = node;
      if (!children.has(name)) {
        void node.childrenNames.push(name);
        void children.set(name, new RegisterNode(node));
      }
      return children.get(name)!;
    }, this.node);
  }
  private seekItems(namespace: readonly [] | N, type: RegisterItemType): RegisterItem<N, D, R>[] {
    const node = this.seekNode(namespace);
    switch (type) {
      case RegisterItemType.Monitor:
        return node.monitors;
      case RegisterItemType.Subscriber:
        return node.subscribers;
    }
  }
}

function isRegistered<N extends readonly unknown[], D, R>(items: RegisterItem<N, D, R>[], type: RegisterItemType, namespace: N, listener: Monitor<N, D> | Subscriber<N, D, R>): boolean {
  return items.some(item =>
    item.type === type &&
    item.namespace.length === namespace.length &&
    item.namespace.every((ns, i) => ns === namespace[i]) &&
    item.listener === listener);
}
