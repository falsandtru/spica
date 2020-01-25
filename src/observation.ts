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
  constructor(
    public readonly parent: RegisterNode<N, D, R> | undefined,
    public readonly index: unknown,
  ) {
  }
  public readonly children: Map<N[number], RegisterNode<N, D, R>> = new Map();
  public readonly childrenIndexes: N[number][] = [];
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
const enum Mode {
  Unreachable,
  Extensible,
  Closest,
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
    const { monitors } = this.seekNode(namespace, Mode.Extensible);
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
    const { subscribers } = this.seekNode(namespace, Mode.Extensible);
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
    const node = this.seekNode(namespace, Mode.Unreachable);
    if (!node) return;
    switch (typeof listener) {
      case 'function': {
        const items: RegisterItem<N, D, R>[] = type === RegisterItemType.Monitor
          ? node.monitors
          : node.subscribers;
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
        const nodes: RegisterNode<N, D, R>[] = [node];
        const queue: RegisterNode<N, D, R>[] = [];
        while (nodes.length + queue.length > 0) {
          while (nodes.length > 0) {
            const node = nodes.pop()!;
            void queue.push(node);
            if (node.childrenIndexes.length === 0) break;
            void nodes.push(...node.children.values());
          }
          assert(queue.length > 0);
          const node = queue.pop()!;
          if (node.subscribers.length > 0) {
            node.subscribers.length = 0;
          }
        }
        return;
      }
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
    const node = this.seekNode(namespace, Mode.Unreachable);
    const results: R[] = [];
    for (const { listener, options: { once } } of node ? this.refsBelow(node, RegisterItemType.Subscriber)[0] : []) {
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
    for (const { listener, options: { once } } of this.refsAbove(node || this.seekNode(namespace, Mode.Closest), RegisterItemType.Monitor)) {
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
    const node = this.seekNode(namespace, Mode.Unreachable);
    if (!node) return [];
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
  private refsBelow({ childrenIndexes, children, monitors, subscribers }: RegisterNode<N, D, R>, type: RegisterItemType): readonly [RegisterItem<N, D, R>[], number] {
    const items = type === RegisterItemType.Monitor
      ? monitors.slice()
      : subscribers.slice();
    let count = 0;
    for (let i = 0; i < childrenIndexes.length; ++i) {
      const name = childrenIndexes[i];
      assert(children.has(name));
      const [below, cnt] = this.refsBelow(children.get(name)!, type);
      count += cnt;
      void concat(items, below);
      if (cnt === 0) {
        void children.delete(name);
        void childrenIndexes.splice(
          findIndex(name, childrenIndexes),
          1);
        void --i;
      }
    }
    return [items, monitors.length + subscribers.length + count];
  }
  private node: RegisterNode<N, D, R> = new RegisterNode(undefined, undefined);
  private seekNode(namespace: readonly [] | N, mode: Mode.Extensible | Mode.Closest): RegisterNode<N, D, R>;
  private seekNode(namespace: readonly [] | N, mode: Mode): RegisterNode<N, D, R> | undefined;
  private seekNode(namespace: readonly [] | N, mode: Mode): RegisterNode<N, D, R> | undefined {
    let node = this.node;
    for (let i = 0; i < namespace.length; ++i) {
      const name = namespace[i];
      const { children } = node;
      if (!children.has(name)) {
        switch (mode) {
          case Mode.Unreachable:
            return;
          case Mode.Closest:
            return node;
        }
        void node.childrenIndexes.push(name);
        void children.set(name, new RegisterNode(node, name));
      }
      node = children.get(name)!;
    }
    return node;
  }
}

function isRegistered<N extends readonly unknown[], D, R>(items: RegisterItem<N, D, R>[], type: RegisterItemType, namespace: N, listener: Monitor<N, D> | Subscriber<N, D, R>): boolean {
  return items.some(item =>
    item.type === type &&
    item.namespace.length === namespace.length &&
    item.namespace.every((ns, i) => ns === namespace[i]) &&
    item.listener === listener);
}
