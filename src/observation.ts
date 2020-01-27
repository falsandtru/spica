import { global } from './global';
import type { PartialTuple, DeepImmutable, DeepRequired } from './type';
import { extend } from './assign';
import { concat } from './concat';
import { causeAsyncException } from './exception';

const { Map, WeakMap, Error } = global;

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
  readonly id: number;
  readonly type: RegisterItemType.Monitor;
  readonly namespace: PartialTuple<N>;
  readonly listener: Monitor<N, D>;
  readonly options: ObserverOptions;
 }
interface SubscriberItem<N extends readonly unknown[], D, R> {
  readonly id: number;
  readonly type: RegisterItemType.Subscriber;
  readonly namespace: N;
  readonly listener: Subscriber<N, D, R>;
  readonly options: ObserverOptions;
}
const enum RegisterItemType {
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
  private readonly node: RegisterNode<N, D, R> = new RegisterNode(undefined, undefined);
  private readonly settings: DeepImmutable<DeepRequired<ObservationOptions>> = {
    limit: 10,
    cleanup: false,
  };
  public monitor(namespace: PartialTuple<N>, listener: Monitor<N, D>, { once = false }: ObserverOptions = {}): () => void {
    if (typeof listener !== 'function') throw new Error(`Spica: Observation: Invalid listener: ${listener}`);
    const { monitors } = this.seekNode(namespace, SeekMode.Extensible);
    if (monitors.length === this.settings.limit) throw new Error(`Spica: Observation: Exceeded max listener limit.`);
    const item = {
      id: ++id,
      type: RegisterItemType.Monitor,
      namespace,
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
      id: ++id,
      type: RegisterItemType.Subscriber,
      namespace,
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
  public off(namespace: N, listener?: Subscriber<N, D, R>): void;
  public off(namespace: PartialTuple<N>, listener?: RegisterItem<N, D, R>): void;
  public off(namespace: PartialTuple<N>, listener?: Subscriber<N, D, R> | RegisterItem<N, D, R>): void {
    const node = this.seekNode(namespace, SeekMode.Breakable);
    if (!node) return;
    switch (typeof listener) {
      case 'object': {
        const items: RegisterItem<N, D, R>[] = listener.type === RegisterItemType.Monitor
          ? node.monitors
          : node.subscribers;
        if (items.length === 0 || listener.id < items[0].id || listener.id > items[items.length - 1].id) return;
        return void remove(items, items.indexOf(listener));
      }
      case 'function': {
        const items = node.subscribers;
        return void remove(items, items.findIndex(item => item.listener === listener));
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
  public refs(namespace: PartialTuple<N>): RegisterItem<N, D, R>[] {
    const node = this.seekNode(namespace, SeekMode.Breakable);
    if (!node) return [];
    return concat<RegisterItem<N, D, R>[]>(
      this.refsBelow(node, RegisterItemType.Monitor),
      this.refsBelow(node, RegisterItemType.Subscriber))
      .reduce((acc, rs) => concat(acc, rs), []);
  }
  private drain(namespace: N, data: D, tracker?: (data: D, results: R[]) => void): void {
    const node = this.seekNode(namespace, SeekMode.Breakable);
    const results: R[] = [];
    const sss = node ? this.refsBelow(node, RegisterItemType.Subscriber) : [];
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
    const mss = this.refsAbove(node || this.seekNode(namespace, SeekMode.Closest), RegisterItemType.Monitor);
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
  private refsAbove({ parent, monitors, subscribers }: RegisterNode<N, D, R>, type: RegisterItemType.Monitor): MonitorItem<N, D>[][];
  private refsAbove({ parent, monitors, subscribers }: RegisterNode<N, D, R>, type: RegisterItemType): RegisterItem<N, D, R>[][] {
    const acc = type === RegisterItemType.Monitor
      ? [monitors]
      : [subscribers];
    while (parent) {
      type === RegisterItemType.Monitor
        ? void (acc as typeof monitors[]).push(parent.monitors)
        : void (acc as typeof subscribers[]).push(parent.subscribers);
      parent = parent.parent;
    }
    return acc;
  }
  private refsBelow(node: RegisterNode<N, D, R>, type: RegisterItemType.Monitor): MonitorItem<N, D>[][];
  private refsBelow(node: RegisterNode<N, D, R>, type: RegisterItemType.Subscriber): SubscriberItem<N, D, R>[][];
  private refsBelow(node: RegisterNode<N, D, R>, type: RegisterItemType): RegisterItem<N, D, R>[][] {
    return this.refsBelow_(node, type, [])[0];
  }
  private refsBelow_({ monitors, subscribers, childrenIndexes, children }: RegisterNode<N, D, R>, type: RegisterItemType, acc: RegisterItem<N, D, R>[][]): readonly [RegisterItem<N, D, R>[][], number] {
    type === RegisterItemType.Monitor
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
  private seekNode(namespace: PartialTuple<N>, mode: SeekMode.Extensible | SeekMode.Closest): RegisterNode<N, D, R>;
  private seekNode(namespace: PartialTuple<N>, mode: SeekMode): RegisterNode<N, D, R> | undefined;
  private seekNode(namespace: PartialTuple<N>, mode: SeekMode): RegisterNode<N, D, R> | undefined {
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
        child = new RegisterNode(node, index);
        void childrenIndexes.push(index);
        void children.set(index, child);
      }
      node = child;
    }
    return node;
  }
}

function remove(target: unknown[], index: number): void {
  if (index === -1) return;
  switch (index) {
    case 0:
      return void target.shift();
    case target.length - 1:
      return void target.pop();
    default:
      return void target.splice(index, 1);
  }
}

function clear<N extends readonly unknown[], D, R>({ monitors, subscribers, childrenIndexes, children }: RegisterNode<N, D, R>): boolean {
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
