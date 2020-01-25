import { global } from './global';
import type { DeepImmutable, DeepRequired } from './type';
import { extend } from './assign';
import { concat } from './concat';
import { findIndex } from './equal';
import { causeAsyncException } from './exception';

const { Map, WeakMap, Error } = global;

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
export type Monitor<N extends readonly unknown[], D> = (data: D, namespace: N) => void;
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
interface MonitorItem<N extends readonly unknown[], D> {
  readonly type: RegisterItemType.Monitor;
  readonly namespace: readonly [] | N;
  alive: boolean;
  readonly listener: Monitor<N, D>;
  readonly options: ObserverOptions;
 }
interface SubscriberItem<N extends readonly unknown[], D, R> {
  readonly type: RegisterItemType.Subscriber;
  readonly namespace: N;
  alive: boolean;
  readonly listener: Subscriber<N, D, R>;
  readonly options: ObserverOptions;
}
const enum RegisterItemType {
  Monitor,
  Subscriber,
}
const enum SeekMode {
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
  private readonly node: RegisterNode<N, D, R> = new RegisterNode(undefined, undefined);
  private readonly settings: DeepImmutable<DeepRequired<ObservationOptions>> = {
    limit: 10,
  };
  public monitor(namespace: readonly [] | N, listener: Monitor<N, D>, { once = false }: ObserverOptions = {}): () => void {
    if (typeof listener !== 'function') throw new Error(`Spica: Observation: Invalid listener: ${listener}`);
    const { monitors } = this.seekNode(namespace, SeekMode.Extensible);
    if (monitors.length === this.settings.limit) throw new Error(`Spica: Observation: Exceeded max listener limit.`);
    const item = {
      type: RegisterItemType.Monitor,
      namespace,
      alive: true,
      listener,
      options: {
        once,
      },
    } as const;
    void monitors.push(item);
    return () => void this.off(namespace, item);
  }
  public on(namespace: N, listener: Subscriber<N, D, R>, { once = false }: ObserverOptions = {}): () => void {
    if (typeof listener !== 'function') throw new Error(`Spica: Observation: Invalid listener: ${listener}`);
    const { subscribers } = this.seekNode(namespace, SeekMode.Extensible);
    if (subscribers.length === this.settings.limit) throw new Error(`Spica: Observation: Exceeded max listener limit.`);
    const item = {
      type: RegisterItemType.Subscriber,
      namespace,
      alive: true,
      listener,
      options: {
        once,
      },
    } as const;
    void subscribers.push(item);
    return () => void this.off(namespace, item);
  }
  public once(namespace: N, listener: Subscriber<N, D, R>): () => void {
    return this.on(namespace, listener, { once: true });
  }
  public off(namespace: readonly [] | N, listener?: Monitor<N, D> | Subscriber<N, D, R>, type?: RegisterItemType): void;
  public off(namespace: readonly [] | N, listener?: RegisterItem<N, D, R>): void;
  public off(namespace: readonly [] | N, listener?: Monitor<N, D> | Subscriber<N, D, R> | RegisterItem<N, D, R>, type: RegisterItemType = RegisterItemType.Subscriber): void {
    const node = this.seekNode(namespace, SeekMode.Unreachable);
    if (!node) return;
    switch (typeof listener) {
      case 'object': {
        if (!listener.alive) return;
        const items: RegisterItem<N, D, R>[] = listener.type === RegisterItemType.Monitor
          ? node.monitors
          : node.subscribers;
        return void remove(items, items.indexOf(listener));
      }
      case 'function': {
        const items: RegisterItem<N, D, R>[] = type === RegisterItemType.Monitor
          ? node.monitors
          : node.subscribers;
        return void remove(items, items.findIndex(item => item.alive && item.listener === listener));
      }
      case 'undefined':
        return void clear(node);
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
    let results!: R[];
    void this.emit(namespace, data, (_, r) => results = r);
    assert(results);
    return results;
  }
  private unrelaies = new WeakMap<Observer<N, D, unknown>, () => void>();
  public relay(source: Observer<N, D, unknown>): () => void {
    if (this.unrelaies.has(source)) return this.unrelaies.get(source)!;
    const unbind = source.monitor([], (data, namespace) =>
      void this.emit(namespace, data));
    const unrelay = () => (
      void this.unrelaies.delete(source),
      void unbind());
    void this.unrelaies.set(source, unrelay);
    return unrelay;
  }
  public refs(namespace: readonly [] | N): RegisterItem<N, D, R>[] {
    const node = this.seekNode(namespace, SeekMode.Unreachable);
    if (!node) return [];
    return concat<RegisterItem<N, D, R>>(this.refsBelow(node, RegisterItemType.Monitor), this.refsBelow(node, RegisterItemType.Subscriber));
  }
  private drain(namespace: N, data: D, tracker?: (data: D, results: R[]) => void): void {
    const node = this.seekNode(namespace, SeekMode.Unreachable);
    const results: R[] = [];
    const ss = node ? this.refsBelow(node, RegisterItemType.Subscriber) : [];
    for (let i = 0; i < ss.length; ++i) {
      const item = ss[i];
      if (item.options.once) {
        void this.off(item.namespace, item);
      }
      try {
        const result = item.listener(data, namespace);
        tracker && void results.push(result);
      }
      catch (reason) {
        void causeAsyncException(reason);
      }
    }
    const ms = this.refsAbove(node || this.seekNode(namespace, SeekMode.Closest), RegisterItemType.Monitor);
    for (let i = 0; i < ms.length; ++i) {
      const item = ms[i];
      if (item.options.once) {
        void this.off(item.namespace, item);
      }
      try {
        void item.listener(data, namespace);
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
  private refsAbove({ parent, monitors, subscribers }: RegisterNode<N, D, R>, type: RegisterItemType.Monitor): MonitorItem<N, D>[];
  private refsAbove({ parent, monitors, subscribers }: RegisterNode<N, D, R>, type: RegisterItemType): RegisterItem<N, D, R>[] {
    const acc = type === RegisterItemType.Monitor
      ? monitors.slice()
      : subscribers.slice();
    while (parent) {
      type === RegisterItemType.Monitor
        ? void concat(acc as typeof monitors, parent.monitors)
        : void concat(acc as typeof subscribers, parent.subscribers);
      parent = parent.parent;
    }
    return acc;
  }
  private refsBelow(node: RegisterNode<N, D, R>, type: RegisterItemType.Monitor): MonitorItem<N, D>[];
  private refsBelow(node: RegisterNode<N, D, R>, type: RegisterItemType.Subscriber): SubscriberItem<N, D, R>[];
  private refsBelow(node: RegisterNode<N, D, R>, type: RegisterItemType): RegisterItem<N, D, R>[] {
    return this.refsBelow_(node, type)[0].reduce((acc, items) =>
      concat(acc, items)
    , []);
  }
  private refsBelow_({ monitors, subscribers, childrenIndexes, children }: RegisterNode<N, D, R>, type: RegisterItemType): readonly [RegisterItem<N, D, R>[][], number] {
    const acc = type === RegisterItemType.Monitor
      ? [monitors]
      : [subscribers];
    let count = 0;
    for (let i = 0; i < childrenIndexes.length; ++i) {
      const name = childrenIndexes[i];
      assert(children.has(name));
      const [items, cnt] = this.refsBelow_(children.get(name)!, type);
      count += cnt;
      void concat(acc, items);
      if (cnt === 0) {
        void children.delete(name);
        void childrenIndexes.splice(findIndex(name, childrenIndexes), 1);
        void --i;
      }
    }
    return [acc, monitors.length + subscribers.length + count];
  }
  private seekNode(namespace: readonly [] | N, mode: SeekMode.Extensible | SeekMode.Closest): RegisterNode<N, D, R>;
  private seekNode(namespace: readonly [] | N, mode: SeekMode): RegisterNode<N, D, R> | undefined;
  private seekNode(namespace: readonly [] | N, mode: SeekMode): RegisterNode<N, D, R> | undefined {
    let node = this.node;
    for (let i = 0; i < namespace.length; ++i) {
      const name = namespace[i];
      const { children } = node;
      if (!children.has(name)) {
        switch (mode) {
          case SeekMode.Unreachable:
            return;
          case SeekMode.Closest:
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

function remove<N extends readonly unknown[], D, R>(items: RegisterItem<N, D, R>[], index: number): void {
  if (index === -1) return;
  items[index].alive = false;
  switch (index) {
    case 0:
      return void items.shift();
    case items.length - 1:
      return void items.pop();
    default:
      return void items.splice(index, 1);
  }
}

function clear<N extends readonly unknown[], D, R>({ subscribers, childrenIndexes, children }: RegisterNode<N, D, R>): void {
  for (let i = 0; i < childrenIndexes.length; ++i) {
    void clear(children.get(childrenIndexes[i])!);
  }
  if (subscribers.length > 0) {
    for (let i = 0; i < subscribers.length; ++i) {
      subscribers[i].alive = false;
    }
    subscribers.length = 0;
  }
}
