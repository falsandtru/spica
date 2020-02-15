import { Map, WeakMap, Error } from './global';
import type { PartialTuple, DeepImmutable, DeepRequired } from './type';
import { extend } from './assign';
import { push } from './array';
import { causeAsyncException } from './exception';

export interface Observer<N extends readonly unknown[], D, R> {
  monitor(namespace: PartialTuple<N>, listener: Monitor<N, D>, options?: ObserverOptions): () => void;
  on(namespace: N, listener: Subscriber<N, D, R>, options?: ObserverOptions): () => void;
  off(namespace: N, listener?: Subscriber<N, D, R>): void;
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

class ListenerNode<N extends readonly unknown[], D, R> {
  constructor(
    public readonly parent: ListenerNode<N, D, R> | undefined,
    public readonly index: unknown,
  ) {
  }
  public readonly children: Map<N[number], ListenerNode<N, D, R>> = new Map();
  public readonly childrenIndexes: N[number][] = [];
  public readonly monitors: MonitorItem<N, D>[] = [];
  public readonly subscribers: SubscriberItem<N, D, R>[] = [];
}
export type ListenerItem<N extends readonly unknown[], D, R> =
  | MonitorItem<N, D>
  | SubscriberItem<N, D, R>;
interface MonitorItem<N extends readonly unknown[], D> {
  readonly id: number;
  readonly type: ListenerType.Monitor;
  readonly namespace: PartialTuple<N>;
  readonly listener: Monitor<N, D>;
  readonly options: ObserverOptions;
 }
interface SubscriberItem<N extends readonly unknown[], D, R> {
  readonly id: number;
  readonly type: ListenerType.Subscriber;
  readonly namespace: N;
  readonly listener: Subscriber<N, D, R>;
  readonly options: ObserverOptions;
}
const enum ListenerType {
  Monitor,
  Subscriber,
}
const enum SeekMode {
  Extensible,
  Breakable,
  Closest,
}

export interface ObservationOptions {
  readonly limit?: number;
  readonly cleanup?: boolean;
}

let id = 0;

export class Observation<N extends readonly unknown[], D, R>
  implements Observer<N, D, R>, Publisher<N, D, R> {
  constructor(opts: ObservationOptions = {}) {
    void extend(this.settings, opts);
  }
  private readonly node: ListenerNode<N, D, R> = new ListenerNode(void 0, void 0);
  private readonly settings: DeepImmutable<DeepRequired<ObservationOptions>> = {
    limit: 10,
    cleanup: false,
  };
  public monitor(namespace: PartialTuple<N>, monitor: Monitor<N, D>, { once = false }: ObserverOptions = {}): () => void {
    if (typeof monitor !== 'function') throw new Error(`Spica: Observation: Invalid listener: ${monitor}`);
    const { monitors } = this.seekNode(namespace, SeekMode.Extensible);
    if (monitors.length === this.settings.limit) throw new Error(`Spica: Observation: Exceeded max listener limit.`);
    const item = {
      id: ++id,
      type: ListenerType.Monitor,
      namespace,
      listener: monitor,
      options: {
        once,
      },
    } as const;
    void monitors.push(item);
    return () => void this.off(namespace, item);
  }
  public on(namespace: N, subscriber: Subscriber<N, D, R>, { once = false }: ObserverOptions = {}): () => void {
    if (typeof subscriber !== 'function') throw new Error(`Spica: Observation: Invalid listener: ${subscriber}`);
    const { subscribers } = this.seekNode(namespace, SeekMode.Extensible);
    if (subscribers.length === this.settings.limit) throw new Error(`Spica: Observation: Exceeded max listener limit.`);
    const item = {
      id: ++id,
      type: ListenerType.Subscriber,
      namespace,
      listener: subscriber,
      options: {
        once,
      },
    } as const;
    void subscribers.push(item);
    return () => void this.off(namespace, item);
  }
  public once(namespace: N, subscriber: Subscriber<N, D, R>): () => void {
    return this.on(namespace, subscriber, { once: true });
  }
  public off(namespace: N, subscriber?: Subscriber<N, D, R>): void;
  public off(namespace: PartialTuple<N>, item?: ListenerItem<N, D, R>): void;
  public off(namespace: PartialTuple<N>, subscriber?: Subscriber<N, D, R> | ListenerItem<N, D, R>): void {
    const node = this.seekNode(namespace, SeekMode.Breakable);
    if (!node) return;
    switch (typeof subscriber) {
      case 'object': {
        const items: ListenerItem<N, D, R>[] = subscriber.type === ListenerType.Monitor
          ? node.monitors
          : node.subscribers;
        if (items.length === 0 || subscriber.id < items[0].id || subscriber.id > items[items.length - 1].id) return;
        return void remove(items, items.indexOf(subscriber));
      }
      case 'function': {
        const items = node.subscribers;
        return void remove(items, items.findIndex(item => item.listener === subscriber));
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
    const unbind = source.monitor([] as PartialTuple<N>, (data, namespace) =>
      void this.emit(namespace, data));
    const unrelay = () => (
      void this.unrelaies.delete(source),
      void unbind());
    void this.unrelaies.set(source, unrelay);
    return unrelay;
  }
  public refs(namespace: PartialTuple<N>): ListenerItem<N, D, R>[] {
    const node = this.seekNode(namespace, SeekMode.Breakable);
    if (!node) return [];
    return push<ListenerItem<N, D, R>[]>(
      this.refsBelow(node, ListenerType.Monitor),
      this.refsBelow(node, ListenerType.Subscriber))
      .reduce((acc, rs) => push(acc, rs), []);
  }
  private drain(namespace: N, data: D, tracker?: (data: D, results: R[]) => void): void {
    const node = this.seekNode(namespace, SeekMode.Breakable);
    const results: R[] = [];
    const sss = node ? this.refsBelow(node, ListenerType.Subscriber) : [];
    for (let i = 0; i < sss.length; ++i) {
      const items = sss[i];
      if (items.length === 0) continue;
      for (let i = 0, max = items[items.length - 1].id; i < items.length && items[i].id <= max; ++i) {
        const item = items[i];
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
        i = i < items.length ? i : items.length - 1;
        for (; i >= 0; --i) {
          if (items[i].id <= item.id) break;
        }
      }
    }
    const mss = this.refsAbove(node || this.seekNode(namespace, SeekMode.Closest), ListenerType.Monitor);
    for (let i = 0; i < mss.length; ++i) {
      const items = mss[i];
      if (items.length === 0) continue;
      for (let i = 0, max = items[items.length - 1].id; i < items.length && items[i].id <= max; ++i) {
        const item = items[i];
        if (item.options.once) {
          void this.off(item.namespace, item);
        }
        try {
          void item.listener(data, namespace);
        }
        catch (reason) {
          void causeAsyncException(reason);
        }
        i = i < items.length ? i : items.length - 1;
        for (; i >= 0; --i) {
          if (items[i].id <= item.id) break;
        }
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
  private refsAbove({ parent, monitors, subscribers }: ListenerNode<N, D, R>, type: ListenerType.Monitor): MonitorItem<N, D>[][];
  private refsAbove({ parent, monitors, subscribers }: ListenerNode<N, D, R>, type: ListenerType): ListenerItem<N, D, R>[][] {
    const acc = type === ListenerType.Monitor
      ? [monitors]
      : [subscribers];
    while (parent) {
      type === ListenerType.Monitor
        ? void (acc as typeof monitors[]).push(parent.monitors)
        : void (acc as typeof subscribers[]).push(parent.subscribers);
      parent = parent.parent;
    }
    return acc;
  }
  private refsBelow(node: ListenerNode<N, D, R>, type: ListenerType.Monitor): MonitorItem<N, D>[][];
  private refsBelow(node: ListenerNode<N, D, R>, type: ListenerType.Subscriber): SubscriberItem<N, D, R>[][];
  private refsBelow(node: ListenerNode<N, D, R>, type: ListenerType): ListenerItem<N, D, R>[][] {
    return this.refsBelow_(node, type, [])[0];
  }
  private refsBelow_({ monitors, subscribers, childrenIndexes, children }: ListenerNode<N, D, R>, type: ListenerType, acc: ListenerItem<N, D, R>[][]): readonly [ListenerItem<N, D, R>[][], number] {
    type === ListenerType.Monitor
      ? void (acc as typeof monitors[]).push(monitors)
      : void (acc as typeof subscribers[]).push(subscribers);
    let count = 0;
    for (let i = 0; i < childrenIndexes.length; ++i) {
      const index = childrenIndexes[i];
      assert(children.has(index));
      const cnt = this.refsBelow_(children.get(index)!, type, acc)[1];
      count += cnt;
      if (cnt === 0 && this.settings.cleanup) {
        void children.delete(index);
        void remove(childrenIndexes, i);
        void --i;
      }
    }
    return [acc, monitors.length + subscribers.length + count];
  }
  private seekNode(namespace: PartialTuple<N>, mode: SeekMode.Extensible | SeekMode.Closest): ListenerNode<N, D, R>;
  private seekNode(namespace: PartialTuple<N>, mode: SeekMode): ListenerNode<N, D, R> | undefined;
  private seekNode(namespace: PartialTuple<N>, mode: SeekMode): ListenerNode<N, D, R> | undefined {
    let node = this.node;
    for (let i = 0; i < namespace.length; ++i) {
      const index = namespace[i];
      const { childrenIndexes, children } = node;
      let child = children.get(index);
      if (!child) {
        switch (mode) {
          case SeekMode.Breakable:
            return;
          case SeekMode.Closest:
            return node;
        }
        child = new ListenerNode(node, index);
        void childrenIndexes.push(index);
        void children.set(index, child);
      }
      node = child;
    }
    return node;
  }
}

function remove(target: unknown[], index: number): void {
  switch (index) {
    case -1:
      return;
    case 0:
      return void target.shift();
    case target.length - 1:
      return void target.pop();
    default:
      return void target.splice(index, 1);
  }
}

function clear<N extends readonly unknown[], D, R>({ monitors, subscribers, childrenIndexes, children }: ListenerNode<N, D, R>): boolean {
  for (let i = 0; i < childrenIndexes.length; ++i) {
    if (!clear(children.get(childrenIndexes[i])!)) continue;
    void children.delete(childrenIndexes[i]);
    void remove(childrenIndexes, i);
    void --i;
  }
  if (subscribers.length > 0) {
    subscribers.length = 0;
  }
  return monitors.length === 0;
}
