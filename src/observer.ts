import type { Inits, DeepImmutable, DeepRequired } from './type';
import { Infinity, Number, Map, WeakSet, Error } from './global';
import { IxList } from './ixlist';
import { extend } from './assign';
import { once } from './function';
import { push, splice } from './array';
import { causeAsyncException } from './exception';

export interface Observer<N extends readonly unknown[], D, R> {
  monitor(namespace: Readonly<N | Inits<N>>, listener: Monitor<N, D>, options?: ObserverOptions): () => void;
  on(namespace: Readonly<N>, listener: Subscriber<N, D, R>, options?: ObserverOptions): () => void;
  off(namespace: Readonly<N>, listener?: Subscriber<N, D, R>): void;
  once(namespace: Readonly<N>, listener: Subscriber<N, D, R>): () => void;
}
export interface ObserverOptions {
  once?: boolean;
}
export interface Publisher<N extends readonly unknown[], D, R> {
  emit(namespace: Readonly<N>, data: D, tracker?: (data: D, results: R[]) => void): void;
  emit(this: Publisher<N, undefined, R>, namespace: Readonly<N>, data?: D, tracker?: (data: D, results: R[]) => void): void;
  reflect(namespace: Readonly<N | Inits<N>>, data: D): R[];
  reflect(this: Publisher<N, undefined, R>, namespace: Readonly<N | Inits<N>>, data?: D): R[];
}
export type Monitor<N extends readonly unknown[], D> = (data: D, namespace: Readonly<N | Inits<N>>) => void;
export type Subscriber<N extends readonly unknown[], D, R> = (data: D, namespace: Readonly<N | Inits<N>>) => R;

class ListenerNode<N extends readonly unknown[], D, R> {
  constructor(
    public readonly parent: ListenerNode<N, D, R> | undefined,
    public readonly index: unknown,
  ) {
  }
  public readonly children = new IxList<N[number], ListenerNode<N, D, R>>(Infinity, new Map());
  public readonly monitors: MonitorItem<N, D>[] = [];
  public readonly subscribers: SubscriberItem<N, D, R>[] = [];
}
export type ListenerItem<N extends readonly unknown[], D, R> =
  | MonitorItem<N, D>
  | SubscriberItem<N, D, R>;
interface MonitorItem<N extends readonly unknown[], D> {
  readonly id: number;
  readonly type: ListenerType.Monitor;
  readonly namespace: Readonly<N | Inits<N>>;
  readonly listener: Monitor<N | Inits<N>, D>;
  readonly options: ObserverOptions;
}
interface SubscriberItem<N extends readonly unknown[], D, R> {
  readonly id: number;
  readonly type: ListenerType.Subscriber;
  readonly namespace: Readonly<N>;
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

export class Observation<N extends readonly unknown[], D, R>
  implements Observer<N, D, R>, Publisher<N, D, R> {
  constructor(opts: ObservationOptions = {}) {
    extend(this.settings, opts);
  }
  private id = 0;
  private readonly node: ListenerNode<N, D, R> = new ListenerNode(void 0, void 0);
  private readonly settings: DeepImmutable<DeepRequired<ObservationOptions>> = {
    limit: 10,
    cleanup: false,
  };
  public monitor(namespace: Readonly<N | Inits<N>>, monitor: Monitor<N, D>, options: ObserverOptions = {}): () => void {
    if (typeof monitor !== 'function') throw new Error(`Spica: Observation: Invalid listener: ${monitor}`);
    const { monitors } = this.seekNode(namespace, SeekMode.Extensible);
    if (monitors.length === this.settings.limit) throw new Error(`Spica: Observation: Exceeded max listener limit.`);
    if (this.id === Number.MAX_SAFE_INTEGER) throw new Error(`Spica: Observation: Max listener ID reached max safe integer.`);
    const item: MonitorItem<N, D> = {
      id: ++this.id,
      type: ListenerType.Monitor,
      namespace,
      listener: monitor,
      options,
    };
    monitors.push(item);
    return once(() => void this.off(namespace, item));
  }
  public on(namespace: Readonly<N>, subscriber: Subscriber<N, D, R>, options: ObserverOptions = {}): () => void {
    if (typeof subscriber !== 'function') throw new Error(`Spica: Observation: Invalid listener: ${subscriber}`);
    const { subscribers } = this.seekNode(namespace, SeekMode.Extensible);
    if (subscribers.length === this.settings.limit) throw new Error(`Spica: Observation: Exceeded max listener limit.`);
    if (this.id === Number.MAX_SAFE_INTEGER) throw new Error(`Spica: Observation: Max listener ID reached max safe integer.`);
    const item: SubscriberItem<N, D, R> = {
      id: ++this.id,
      type: ListenerType.Subscriber,
      namespace,
      listener: subscriber,
      options,
    };
    subscribers.push(item);
    return once(() => void this.off(namespace, item));
  }
  public once(namespace: Readonly<N>, subscriber: Subscriber<N, D, R>): () => void {
    return this.on(namespace, subscriber, { once: true });
  }
  public off(namespace: Readonly<N>, subscriber?: Subscriber<N, D, R>): void;
  public off(namespace: Readonly<N | Inits<N>>, item?: ListenerItem<N, D, R>): void;
  public off(namespace: Readonly<N | Inits<N>>, subscriber?: Subscriber<N, D, R> | ListenerItem<N, D, R>): void {
    const node = this.seekNode(namespace, SeekMode.Breakable);
    if (!node) return;
    switch (typeof subscriber) {
      case 'object': {
        const items: ListenerItem<N, D, R>[] = subscriber.type === ListenerType.Monitor
          ? node.monitors
          : node.subscribers;
        if (items.length === 0 || subscriber.id < items[0].id || subscriber.id > items[items.length - 1].id) return;
        return void splice(items, items.indexOf(subscriber), 1);
      }
      case 'function': {
        const items = node.subscribers;
        return void splice(items, items.findIndex(item => item.listener === subscriber), 1);
      }
      case 'undefined':
        return void clear(node);
    }
  }
  public emit(namespace: Readonly<N>, data: D, tracker?: (data: D, results: R[]) => void): void
  public emit(this: Publisher<N, void, R>, namespace: Readonly<N>, data?: D, tracker?: (data: D, results: R[]) => void): void
  public emit(namespace: Readonly<N>, data: D, tracker?: (data: D, results: R[]) => void): void {
    this.drain(namespace, data, tracker);
  }
  public reflect(namespace: Readonly<N | Inits<N>>, data: D): R[]
  public reflect(this: Publisher<N, void, R>, namespace: Readonly<N | Inits<N>>, data?: D): R[]
  public reflect(namespace: Readonly<N | Inits<N>>, data: D): R[] {
    let results!: R[];
    this.emit(namespace as N, data, (_, r) => results = r);
    assert(results);
    return results;
  }
  private relaies = new WeakSet<Observer<N, D, unknown>>();
  public relay(source: Observer<N, D, unknown>): () => void {
    assert(!this.relaies.has(source));
    if (this.relaies.has(source)) throw new Error(`Spica: Observation: Relay source is already registered.`);
    this.relaies.add(source);
    return source.monitor([] as Inits<N>, (data, namespace) =>
      void this.emit(namespace as N, data));
  }
  public refs(namespace: Readonly<N | Inits<N>>): ListenerItem<N, D, R>[] {
    const node = this.seekNode(namespace, SeekMode.Breakable);
    if (!node) return [];
    return push<ListenerItem<N, D, R>[]>(
      this.refsBelow(node, ListenerType.Monitor),
      this.refsBelow(node, ListenerType.Subscriber))
      .reduce((acc, rs) => push(acc, rs), []);
  }
  private drain(namespace: Readonly<N>, data: D, tracker?: (data: D, results: R[]) => void): void {
    const node = this.seekNode(namespace, SeekMode.Breakable);
    const results: R[] = [];
    const sss = node ? this.refsBelow(node, ListenerType.Subscriber) : [];
    for (let i = 0; i < sss.length; ++i) {
      const items = sss[i];
      if (items.length === 0) continue;
      for (let i = 0, max = items[items.length - 1].id; i < items.length && items[i].id <= max; ++i) {
        const item = items[i];
        if (item.options.once) {
          this.off(item.namespace, item);
        }
        try {
          const result = item.listener(data, namespace);
          tracker && results.push(result);
        }
        catch (reason) {
          causeAsyncException(reason);
        }
        i = i < items.length ? i : items.length - 1;
        for (; i >= 0 && items[i].id > item.id; --i);
      }
    }
    const mss = this.refsAbove(node || this.seekNode(namespace, SeekMode.Closest), ListenerType.Monitor);
    for (let i = 0; i < mss.length; ++i) {
      const items = mss[i];
      if (items.length === 0) continue;
      for (let i = 0, max = items[items.length - 1].id; i < items.length && items[i].id <= max; ++i) {
        const item = items[i];
        if (item.options.once) {
          this.off(item.namespace, item);
        }
        try {
          item.listener(data, namespace);
        }
        catch (reason) {
          causeAsyncException(reason);
        }
        i = i < items.length ? i : items.length - 1;
        for (; i >= 0 && items[i].id > item.id; --i);
      }
    }
    if (tracker) {
      try {
        tracker(data, results);
      }
      catch (reason) {
        causeAsyncException(reason);
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
        ? (acc as typeof monitors[]).push(parent.monitors)
        : (acc as typeof subscribers[]).push(parent.subscribers);
      parent = parent.parent;
    }
    return acc;
  }
  private refsBelow(node: ListenerNode<N, D, R>, type: ListenerType.Monitor): MonitorItem<N, D>[][];
  private refsBelow(node: ListenerNode<N, D, R>, type: ListenerType.Subscriber): SubscriberItem<N, D, R>[][];
  private refsBelow(node: ListenerNode<N, D, R>, type: ListenerType): ListenerItem<N, D, R>[][] {
    return this.refsBelow_(node, type, [])[0];
  }
  private refsBelow_({ monitors, subscribers, children }: ListenerNode<N, D, R>, type: ListenerType, acc: ListenerItem<N, D, R>[][]): readonly [ListenerItem<N, D, R>[][], number] {
    type === ListenerType.Monitor
      ? (acc as typeof monitors[]).push(monitors)
      : (acc as typeof subscribers[]).push(subscribers);
    let count = 0;
    for (let node = children.last, i = 0; node && i < children.length; (node = children.node(node.prev)) && ++i) {
      const cnt = this.refsBelow_(node.value, type, acc)[1];
      count += cnt;
      if (cnt === 0 && this.settings.cleanup) {
        node = children.node(children.del(node.key, node.index)!.next);
        if (!node) break;
        --i;
      }
    }
    return [acc, monitors.length + subscribers.length + count];
  }
  private seekNode(namespace: Readonly<N | Inits<N>>, mode: SeekMode.Extensible | SeekMode.Closest): ListenerNode<N, D, R>;
  private seekNode(namespace: Readonly<N | Inits<N>>, mode: SeekMode): ListenerNode<N, D, R> | undefined;
  private seekNode(namespace: Readonly<N | Inits<N>>, mode: SeekMode): ListenerNode<N, D, R> | undefined {
    let node = this.node;
    for (let i = 0; i < namespace.length; ++i) {
      const name = namespace[i];
      const { children } = node;
      let child = children.get(name);
      if (!child) {
        switch (mode) {
          case SeekMode.Breakable:
            return;
          case SeekMode.Closest:
            return node;
        }
        child = new ListenerNode(node, name);
        children.add(name, child);
      }
      node = child;
    }
    return node;
  }
}

function clear<N extends readonly unknown[], D, R>({ monitors, subscribers, children }: ListenerNode<N, D, R>): boolean {
  for (let node = children.last, i = 0; node && i < children.length; (node = children.node(node.prev)) && ++i) {
    if (!clear(node.value)) continue;
    node = children.node(children.del(node.key, node.index)!.next);
    if (!node) break;
    --i;
  }
  splice(subscribers, 0);
  return monitors.length === 0;
}
