import { MAX_SAFE_INTEGER } from './alias';
import { Inits } from './type';
import { List } from './list';
import { push } from './array';
import { singleton } from './function';
import { causeAsyncException } from './exception';

class Node<T> implements List.Node {
  constructor(
    public value: T,
  ) {
  }
  public next?: this = undefined;
  public prev?: this = undefined;
}

export interface Observer<N extends readonly unknown[], D, R> {
  monitor(namespace: Readonly<N | Inits<N>>, listener: Monitor<N, D>, options?: ObserverOptions): () => void;
  on(namespace: Readonly<N>, listener: Subscriber<N, D, R>, options?: ObserverOptions): () => void;
  off(namespace: Readonly<N>, listener: Subscriber<N, D, R>): void;
  off(namespace: Readonly<N | Inits<N>>): void;
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
    public readonly parent?: ListenerNode<N, D, R>,
  ) {
  }
  public mid = 0;
  public sid = 0;
  public readonly monitors = new List<Node<MonitorItem<N, D>>>();
  public readonly subscribers = new List<Node<SubscriberItem<N, D, R>>>();
  public readonly index = new Map<N[number], ListenerNode<N, D, R>>();
  public readonly children = new List<Node<ListenerNode<N, D, R>>>();
  public reset(listeners: List<Node<ListenerItem<N, D, R>>>): void {
    switch (listeners) {
      case this.monitors:
        this.mid = 0;
        for (let node = listeners.head, i = listeners.length; node && i--; node = node.next) {
          node.value.id = ++this.mid;
        }
        return;
      case this.subscribers:
        this.sid = 0;
        for (let node = listeners.head, i = listeners.length; node && i--; node = node.next) {
          node.value.id = ++this.sid;
        }
        return;
      default:
        throw new Error('Unreachable');
    }
  }
  public clear(disposable = false): boolean {
    const { monitors, subscribers, index, children } = this;
    const stack = [];
    for (let child = children.head, i = children.length; child && i--;) {
      if (child.value.clear(true)) {
        const next = child.next;
        disposable
          ? stack.push(child.value.name)
          : index.delete(child.value.name);
        children.delete(child);
        child = next;
      }
      else {
        child = child.next;
      }
    }
    if (children.length) while (stack.length) {
      index.delete(stack.pop());
    }
    subscribers.clear();
    return monitors.length === 0
        && children.length === 0;
  }
}
export type ListenerItem<N extends readonly unknown[], D, R> =
  | MonitorItem<N, D>
  | SubscriberItem<N, D, R>;
interface MonitorItem<N extends readonly unknown[], D> {
  id: number;
  readonly type: ListenerType.Monitor;
  readonly namespace: Readonly<N | Inits<N>>;
  readonly listener: Monitor<N, D>;
  readonly options: ObserverOptions;
}
interface SubscriberItem<N extends readonly unknown[], D, R> {
  id: number;
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
}

export class Observation<N extends readonly unknown[], D, R>
  implements Observer<N, D, R>, Publisher<N, D, R> {
  constructor(opts?: ObservationOptions) {
    this.limit = opts?.limit ?? 10;
  }
  private readonly node = new ListenerNode<N, D, R>(undefined);
  private readonly limit: number;
  public monitor(namespace: Readonly<N | Inits<N>>, monitor: Monitor<N, D>, options: ObserverOptions = {}): () => void {
    if (typeof monitor !== 'function') throw new Error(`Spica: Observation: Invalid listener: ${monitor}`);
    const node = this.seek(namespace, SeekMode.Extensible);
    const monitors = node.monitors;
    if (monitors.length === this.limit) throw new Error(`Spica: Observation: Exceeded max listener limit`);
    node.mid === MAX_SAFE_INTEGER && node.reset(monitors);
    const inode = monitors.push(new Node({
      id: ++node.mid,
      type: ListenerType.Monitor,
      namespace,
      listener: monitor,
      options,
    }));
    return singleton(() => void monitors.delete(inode));
  }
  public on(namespace: Readonly<N>, subscriber: Subscriber<N, D, R>, options: ObserverOptions = {}): () => void {
    if (typeof subscriber !== 'function') throw new Error(`Spica: Observation: Invalid listener: ${subscriber}`);
    const node = this.seek(namespace, SeekMode.Extensible);
    const subscribers = node.subscribers;
    if (subscribers.length === this.limit) throw new Error(`Spica: Observation: Exceeded max listener limit`);
    node.sid === MAX_SAFE_INTEGER && node.reset(subscribers);
    const inode = subscribers.push(new Node({
      id: ++node.sid,
      type: ListenerType.Subscriber,
      namespace,
      listener: subscriber,
      options,
    }));
    return singleton(() => void subscribers.delete(inode));
  }
  public once(namespace: Readonly<N>, subscriber: Subscriber<N, D, R>): () => void {
    return this.on(namespace, subscriber, { once: true });
  }
  public off(namespace: Readonly<N>, subscriber: Subscriber<N, D, R>): void;
  public off(namespace: Readonly<N | Inits<N>>): void;
  public off(namespace: Readonly<N | Inits<N>>, subscriber?: Subscriber<N, D, R>): void {
    if (subscriber) {
      const list = this.seek(namespace, SeekMode.Breakable)?.subscribers;
      const node = list?.find(node => node.value.listener === subscriber);
      assert(node?.next || node?.prev || list?.head === node);
      node && list?.delete(node);
    }
    else {
      void this.seek(namespace, SeekMode.Breakable)?.clear();
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
  private relaies!: WeakSet<Observer<N, D, unknown>>;
  public relay(source: Observer<N, D, unknown>): () => void {
    this.relaies ??= new WeakSet();
    assert(!this.relaies.has(source));
    if (this.relaies.has(source)) throw new Error(`Spica: Observation: Relay source is already registered`);
    this.relaies.add(source);
    return source.monitor([] as Inits<N>, (data, namespace) =>
      void this.emit(namespace as N, data));
  }
  public refs(namespace: Readonly<N | Inits<N>>): ListenerItem<N, D, R>[] {
    const node = this.seek(namespace, SeekMode.Breakable);
    if (node === undefined) return [];
    return this.listenersBelow(node)
      .reduce((acc, listeners) => push(acc, listeners.flatMap(node => [node.value])), []);
  }
  private drain(namespace: Readonly<N>, data: D, tracker?: (data: D, results: R[]) => void): void {
    let node = this.seek(namespace, SeekMode.Breakable);
    const results: R[] = [];
    for (let lists = node ? this.listenersBelow(node, ListenerType.Subscriber) : [],
             i = 0; i < lists.length; ++i) {
      const items = lists[i];
      if (items.length === 0) continue;
      const recents: Node<SubscriberItem<N, D, R>>[] = [];
      const max = items.last!.value.id;
      let min = 0;
      let prev: typeof recents[0] | undefined;
      for (let node = items.head; node && min < node.value.id && node.value.id <= max;) {
        min = node.value.id;
        const item = node.value;
        item.options.once && items.delete(node);
        try {
          const result = item.listener(data, namespace);
          tracker && results.push(result);
        }
        catch (reason) {
          causeAsyncException(reason);
        }
        (node.next !== undefined || node.prev !== undefined || items.head === node) && recents.push(node);
        node = node.next ?? prev?.next ?? rollback(recents, item => item.next) ?? items.head;
        prev = node?.prev;
      }
    }
    node ??= this.seek(namespace, SeekMode.Closest);
    for (let lists = this.listenersAbove(node, ListenerType.Monitor),
             i = 0; i < lists.length; ++i) {
      const items = lists[i];
      if (items.length === 0) continue;
      const recents: Node<MonitorItem<N, D>>[] = [];
      const max = items.last!.value.id;
      let min = 0;
      let prev: typeof recents[0] | undefined;
      for (let node = items.head; node && min < node.value.id && node.value.id <= max;) {
        min = node.value.id;
        const item = node.value;
        item.options.once && items.delete(node);
        try {
          item.listener(data, namespace);
        }
        catch (reason) {
          causeAsyncException(reason);
        }
        (node.next !== undefined || node.prev !== undefined || items.head === node) && recents.push(node);
        node = node.next ?? prev?.next ?? rollback(recents, item => item.next) ?? items.head;
        prev = node?.prev;
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
  private seek(namespace: Readonly<N | Inits<N>>, mode: SeekMode.Extensible | SeekMode.Closest): ListenerNode<N, D, R>;
  private seek(namespace: Readonly<N | Inits<N>>, mode: SeekMode): ListenerNode<N, D, R> | undefined;
  private seek(namespace: Readonly<N | Inits<N>>, mode: SeekMode): ListenerNode<N, D, R> | undefined {
    let node = this.node;
    for (let i = 0; i < namespace.length; ++i) {
      const name = namespace[i];
      const { index, children } = node;
      let child = index.get(name);
      if (child === undefined) {
        switch (mode) {
          case SeekMode.Breakable:
            return;
          case SeekMode.Closest:
            return node;
        }
        child = new ListenerNode(name, node);
        index.set(name, child);
        children.push(new Node(child));
      }
      node = child;
    }
    return node;
  }
  private listenersAbove({ parent, monitors }: ListenerNode<N, D, R>, type: ListenerType.Monitor): List<Node<MonitorItem<N, D>>>[];
  private listenersAbove({ parent, monitors }: ListenerNode<N, D, R>): List<Node<MonitorItem<N, D>>>[] {
    const acc = [monitors];
    while (parent) {
      acc.push(parent.monitors);
      parent = parent.parent;
    }
    return acc;
  }
  private listenersBelow(node: ListenerNode<N, D, R>): List<Node<ListenerItem<N, D, R>>>[];
  private listenersBelow(node: ListenerNode<N, D, R>, type: ListenerType.Subscriber): List<Node<SubscriberItem<N, D, R>>>[];
  private listenersBelow(node: ListenerNode<N, D, R>, type?: ListenerType.Subscriber): List<Node<ListenerItem<N, D, R>>>[] {
    return this.listenersBelow$(node, type, [])[0];
  }
  private listenersBelow$(
    { monitors, subscribers, index, children }: ListenerNode<N, D, R>,
    type: ListenerType.Subscriber | undefined,
    acc: List<Node<ListenerItem<N, D, R>>>[],
  ): readonly [List<Node<ListenerItem<N, D, R>>>[], number] {
    switch (type) {
      case ListenerType.Subscriber:
        acc.push(subscribers);
        break;
      default:
        acc.push(monitors, subscribers);
    }
    let count = 0;
    for (let child = children.head, i = children.length; child && i--;) {
      const cnt = this.listenersBelow$(child.value, type, acc)[1];
      count += cnt;
      if (cnt === 0) {
        const next = child.next;
        index.delete(child.value.name);
        children.delete(child);
        child = next;
      }
      else {
        child = child.next;
      }
    }
    return [acc, monitors.length + subscribers.length + count];
  }
}

function rollback<T>(array: T[], matcher: (value: T) => unknown): T | undefined {
  for (let i = array.length; i--;) {
    if (matcher(array[i])) return array[i];
    array.pop();
  }
}
