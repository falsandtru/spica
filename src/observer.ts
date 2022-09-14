import type { Inits } from './type';
import { Number, Map, WeakSet, Error } from './global';
import { List } from './invlist';
import { push } from './array';
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
    public readonly name: N[number],
    public readonly parent: ListenerNode<N, D, R> | undefined,
  ) {
  }
  public readonly monitors = new List<MonitorItem<N, D>>();
  public readonly subscribers = new List<SubscriberItem<N, D, R>>();
  public readonly index = new Map<N[number], ListenerNode<N, D, R>>();
  public readonly children = new List<ListenerNode<N, D, R>>();
  public clear(): boolean {
    const { monitors, subscribers, index, children } = this;
    for (let node = children.head, i = children.length; node && i--;) {
      node = node.value.clear()
        ? [node.next, void index.delete(node.value.name), void node.delete()][0]!
        : node.next;
    }
    subscribers.clear();
    return monitors.length === 0;
  }
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
  constructor({ limit, cleanup }: ObservationOptions = {}) {
    this.limit = limit ?? 10;
    this.cleanup = cleanup ?? false;
  }
  private id = Number.MIN_SAFE_INTEGER;
  private readonly node: ListenerNode<N, D, R> = new ListenerNode(void 0, void 0);
  private readonly limit: number;
  private readonly cleanup: boolean;
  public monitor(namespace: Readonly<N | Inits<N>>, monitor: Monitor<N, D>, options: ObserverOptions = {}): () => void {
    if (typeof monitor !== 'function') throw new Error(`Spica: Observation: Invalid listener: ${monitor}`);
    const { monitors } = this.seekNode(namespace, SeekMode.Extensible);
    if (monitors.length === this.limit) throw new Error(`Spica: Observation: Exceeded max listener limit.`);
    if (this.id === Number.MAX_SAFE_INTEGER) throw new Error(`Spica: Observation: Max listener ID reached max safe integer.`);
    const node = monitors.push({
      id: ++this.id,
      type: ListenerType.Monitor,
      namespace,
      listener: monitor,
      options,
    });
    return () => void node.delete();
  }
  public on(namespace: Readonly<N>, subscriber: Subscriber<N, D, R>, options: ObserverOptions = {}): () => void {
    if (typeof subscriber !== 'function') throw new Error(`Spica: Observation: Invalid listener: ${subscriber}`);
    const { subscribers } = this.seekNode(namespace, SeekMode.Extensible);
    if (subscribers.length === this.limit) throw new Error(`Spica: Observation: Exceeded max listener limit.`);
    if (this.id === Number.MAX_SAFE_INTEGER) throw new Error(`Spica: Observation: Max listener ID reached max safe integer.`);
    const node = subscribers.push({
      id: ++this.id,
      type: ListenerType.Subscriber,
      namespace,
      listener: subscriber,
      options,
    });
    return () => void node.delete();
  }
  public once(namespace: Readonly<N>, subscriber: Subscriber<N, D, R>): () => void {
    return this.on(namespace, subscriber, { once: true });
  }
  public off(namespace: Readonly<N>, subscriber?: Subscriber<N, D, R>): void {
    return subscriber
      ? void this.seekNode(namespace, SeekMode.Breakable)
        ?.subscribers
        ?.find(item => item.listener === subscriber)
        ?.delete()
      : void this.seekNode(namespace, SeekMode.Breakable)
        ?.clear();
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
  private relaies!: WeakSet<Observer<N, D, unknown>>;
  public relay(source: Observer<N, D, unknown>): () => void {
    this.relaies ??= new WeakSet();
    assert(!this.relaies.has(source));
    if (this.relaies.has(source)) throw new Error(`Spica: Observation: Relay source is already registered.`);
    this.relaies.add(source);
    return source.monitor([] as Inits<N>, (data, namespace) =>
      void this.emit(namespace as N, data));
  }
  public refs(namespace: Readonly<N | Inits<N>>): ListenerItem<N, D, R>[] {
    const node = this.seekNode(namespace, SeekMode.Breakable);
    if (!node) return [];
    return push<List<ListenerItem<N, D, R>>>(
      this.refsBelow(node, ListenerType.Monitor),
      this.refsBelow(node, ListenerType.Subscriber))
      .reduce((acc, listeners) => push(acc, listeners.toArray()), []);
  }
  private drain(namespace: Readonly<N>, data: D, tracker?: (data: D, results: R[]) => void): void {
    const node = this.seekNode(namespace, SeekMode.Breakable);
    const results: R[] = [];
    const sss = node ? this.refsBelow(node, ListenerType.Subscriber) : [];
    for (let i = 0; i < sss.length; ++i) {
      const items = sss[i];
      if (items.length === 0) continue;
      for (let max = items.last!.value.id, head = items.head, node = head; node;) {
        const item = node.value;
        if (item.id > max) break;
        item.options.once && node.delete();
        try {
          const result = item.listener(data, namespace);
          tracker && results.push(result);
        }
        catch (reason) {
          causeAsyncException(reason);
        }
        node = node.next;
        if (node === head) break;
      }
    }
    const mss = this.refsAbove(node || this.seekNode(namespace, SeekMode.Closest), ListenerType.Monitor);
    for (let i = 0; i < mss.length; ++i) {
      const items = mss[i];
      if (items.length === 0) continue;
      for (let max = items.last!.value.id, head = items.head, node = head; node;) {
        const item = node.value;
        if (item.id > max) break;
        item.options.once && node.delete();
        try {
          item.listener(data, namespace);
        }
        catch (reason) {
          causeAsyncException(reason);
        }
        node = node.next;
        if (node === head) break;
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
  private refsAbove({ parent, monitors, subscribers }: ListenerNode<N, D, R>, type: ListenerType.Monitor): List<MonitorItem<N, D>>[];
  private refsAbove({ parent, monitors, subscribers }: ListenerNode<N, D, R>, type: ListenerType): List<ListenerItem<N, D, R>>[] {
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
  private refsBelow(node: ListenerNode<N, D, R>, type: ListenerType.Monitor): List<MonitorItem<N, D>>[];
  private refsBelow(node: ListenerNode<N, D, R>, type: ListenerType.Subscriber): List<SubscriberItem<N, D, R>>[];
  private refsBelow(node: ListenerNode<N, D, R>, type: ListenerType): List<ListenerItem<N, D, R>>[] {
    return this.refsBelow_(node, type, [])[0];
  }
  private refsBelow_({ monitors, subscribers, index, children }: ListenerNode<N, D, R>, type: ListenerType, acc: List<ListenerItem<N, D, R>>[]): readonly [List<ListenerItem<N, D, R>>[], number] {
    type === ListenerType.Monitor
      ? (acc as typeof monitors[]).push(monitors)
      : (acc as typeof subscribers[]).push(subscribers);
    let count = 0;
    for (let node = children.head, i = children.length; node && i--;) {
      const cnt = this.refsBelow_(node.value, type, acc)[1];
      count += cnt;
      node = cnt === 0 && this.cleanup
        ? [node.next, void index.delete(node.value.name), void node.delete()][0]!
        : node.next;
    }
    return [acc, monitors.length + subscribers.length + count];
  }
  private seekNode(namespace: Readonly<N | Inits<N>>, mode: SeekMode.Extensible | SeekMode.Closest): ListenerNode<N, D, R>;
  private seekNode(namespace: Readonly<N | Inits<N>>, mode: SeekMode): ListenerNode<N, D, R> | undefined;
  private seekNode(namespace: Readonly<N | Inits<N>>, mode: SeekMode): ListenerNode<N, D, R> | undefined {
    let node = this.node;
    for (let i = 0; i < namespace.length; ++i) {
      const name = namespace[i];
      const { index, children } = node;
      let child = index.get(name);
      if (!child) {
        switch (mode) {
          case SeekMode.Breakable:
            return;
          case SeekMode.Closest:
            return node;
        }
        child = new ListenerNode(name, node);
        index.set(name, child);
        children.push(child);
      }
      node = child;
    }
    return node;
  }
}
