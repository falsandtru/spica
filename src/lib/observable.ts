import { Observer, Publisher, Monitor, Subscriber } from '../../index.d';
import { concat } from './concat';
import { stringify } from './stringify';

interface SubscriberMapNode<T extends ReadonlyArray<any>, D, R> {
  parent: SubscriberMapNode<T, D, R> | undefined;
  children: Map<keyof T, SubscriberMapNode<T, D, R>>;
  childrenNames: (keyof T)[];
  registers: Register<T, D, R>[];
}
type Register<T extends ReadonlyArray<any>, D, R> = [
  T,
  Subscriber<T, D, R>,
  false,
  Subscriber<T, D, R>
] | [
  T,
  Monitor<T, D>,
  true,
  Monitor<T, D>
];

export class Observable<T extends ReadonlyArray<any>, D, R>
  implements Observer<T, D, R>, Publisher<T, D, R> {
  public monitor(namespace: T, subscriber: Subscriber<T, D, any>, identifier: Subscriber<T, D, R> = subscriber): () => void {
    void this.throwTypeErrorIfInvalidSubscriber_(subscriber, namespace);
    void this.seekNode_(namespace).registers.push([namespace, identifier, true, subscriber]);
    return () => this.off(namespace, identifier, true);
  }
  public on(namespace: T, subscriber: Subscriber<T, D, R>, identifier: Subscriber<T, D, R> = subscriber): () => void {
    void this.throwTypeErrorIfInvalidSubscriber_(subscriber, namespace);
    void this.seekNode_(namespace).registers.push([namespace, identifier, false, data => subscriber(data, namespace)]);
    return () => this.off(namespace, identifier);
  }
  public off(namespace: T, subscriber?: Subscriber<T, D, R>, monitor: boolean = false): void {
    switch (typeof subscriber) {
      case 'function':
        return void this.seekNode_(namespace).registers
          .some(([, identifier, monitor_], i, registers) => {
            if (subscriber !== identifier) return false;
            if (monitor_ !== monitor) return false;
            switch (i) {
              case 0:
                return !void registers.shift();
              case registers.length - 1:
                return !void registers.pop();
              default:
                return !void registers.splice(i, 1);
            }
          });
      case 'undefined': {
        const node = this.seekNode_(namespace);
        void node.childrenNames.slice()
          .forEach(name => {
            void this.off(<T><any>namespace.concat([name]));
            const child = node.children.get(name);
            if (!child) return;
            if (child.registers.length + child.childrenNames.length > 0) return;
            void node.children.delete(name);
            assert(node.childrenNames.findIndex(value => value === name || (name !== name && value !== value)) !== -1);
            void node.childrenNames.splice(node.childrenNames.findIndex(value => value === name || (name !== name && value !== value)), 1);
          });
        node.registers = node.registers
          .filter(([, , monitor]) => monitor);
        return;
      }
      default:
        throw this.throwTypeErrorIfInvalidSubscriber_(subscriber, namespace);
    }
  }
  public once(namespace: T, subscriber: Subscriber<T, D, R>): () => void {
    void this.throwTypeErrorIfInvalidSubscriber_(subscriber, namespace);
    return this
      .on(
        namespace,
        data => (
          void this.off(namespace, subscriber),
          subscriber(data, namespace)),
        subscriber);
  }
  public emit(namespace: T, data: D, tracker?: (data: D, results: R[]) => void): void
  public emit(this: Observable<T, void, R>, type: T, data?: D, tracker?: (data: D, results: R[]) => void): void
  public emit(namespace: T, data: D, tracker?: (data: D, results: R[]) => void): void {
    void this.drain_(namespace, data, tracker);
  }
  public reflect(namespace: T, data: D): R[]
  public reflect(this: Observable<T, void, R>, type: T, data?: D): R[]
  public reflect(namespace: T, data: D): R[] {
    let results: R[] = [];
    void this.emit(namespace, <D>data, (_, r) => results = r);
    assert(Array.isArray(results));
    return results;
  }
  public relay(source: Observer<T, D, any>): () => void {
    return source.monitor(<T><any>[], (data, namespace) =>
      void this.emit(namespace, data));
  }
  private drain_(namespace: T, data: D, tracker?: (data: D, results: R[]) => void): void {
    const results: R[] = [];
    void this.refsBelow_(this.seekNode_(namespace))
      .reduce<void>((_, sub) => {
        const [, , monitor, subscriber] = sub;
        if (monitor) return;
        try {
          const result: R = subscriber(data, namespace);
          if (tracker) {
            results[results.length] = result;
          }
        }
        catch (reason) {
          if (reason !== void 0 && reason !== null) {
            assert(!console.debug(stringify(reason)));
            void console.error(reason);
          }
        }
      }, void 0);
    void this.refsAbove_(this.seekNode_(namespace))
      .reduce<void>((_, sub) => {
        const [, , monitor, subscriber] = sub;
        if (!monitor) return;
        try {
          void subscriber(data, namespace);
        }
        catch (reason) {
          if (reason !== void 0 && reason !== null) {
            assert(!console.debug(stringify(reason)));
            void console.error(reason);
          }
        }
      }, void 0);
    if (tracker) {
      try {
        void tracker(data, results);
      }
      catch (reason) {
        assert(!console.debug(stringify(reason)));
        void console.error(reason);
      }
    }
  }
  public refs(namespace: never[] | T): Register<T, D, R>[] {
    return this.refsBelow_(this.seekNode_(namespace));
  }
  private refsAbove_({parent, registers}: SubscriberMapNode<T, D, R>): Register<T, D, R>[] {
    registers = concat([], registers);
    while (parent) {
      registers = concat(registers, parent.registers);
      parent = parent.parent;
    }
    return registers;
  }
  private refsBelow_({childrenNames, children, registers}: SubscriberMapNode<T, D, R>): Register<T, D, R>[] {
    registers = concat([], registers);
    for (let i = 0; i < childrenNames.length; ++i) {
      const name = childrenNames[i];
      const below = this.refsBelow_(children.get(name)!);
      registers = concat(registers, below);
      if (below.length === 0) {
        void children.delete(name);
        void childrenNames.splice(childrenNames.findIndex(value => value === name || (name !== name && value !== value)), 1);
        void --i;
      }
    }
    return registers;
  }
  private node_: SubscriberMapNode<T, D, R> = {
    parent: void 0,
    children: new Map(),
    childrenNames: [],
    registers: []
  };
  private seekNode_(types: never[] | T): SubscriberMapNode<T, D, R> {
    let node = this.node_;
    for (const type of types) {
      const {children} = node;
      if (!children.has(type)) {
        void node.childrenNames.push(type);
        children.set(type, {
          parent: node,
          children: new Map(),
          childrenNames: [],
          registers: <Register<T, D, R>[]>[]
        });
      }
      node = children.get(type)!;
    }
    return node;
  }
  private throwTypeErrorIfInvalidSubscriber_(subscriber: Subscriber<T, D, R> | undefined, types: T): void {
    switch (typeof subscriber) {
      case 'function':
        return;
      default:
        throw new TypeError(`Spica: Observable: Invalid subscriber.\n\t${types} ${subscriber}`);
    }
  }
}
