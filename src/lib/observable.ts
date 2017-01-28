import { Observer, Publisher } from 'spica';
import { concat } from './concat';
import { stringify } from './stringify';

interface SubscriberMapNode<T, D, R> {
  parent: SubscriberMapNode<T, D, R> | undefined;
  children: Map<keyof T, SubscriberMapNode<T, D, R>>;
  childrenNames: (keyof T)[];
  registers: Register<T, D, R>[];
}
type Register<T, D, R> = [
  T,
  Subscriber<D, R>,
  boolean,
  Subscriber<D, R>
];
type Subscriber<D, R> = (data: D) => R;

export class Observable<T extends any[], D, R>
  implements Observer<T, D, R>, Publisher<T, D, R> {
  public monitor(namespace: T, subscriber: Subscriber<D, R>, identifier: Subscriber<D, R> = subscriber): () => void {
    void this.throwTypeErrorIfInvalidSubscriber_(subscriber, namespace);
    void this.seekNode_(namespace).registers.push([namespace, identifier, true, subscriber]);
    return () => this.off(namespace, identifier);
  }
  public on(namespace: T, subscriber: Subscriber<D, R>, identifier: Subscriber<D, R> = subscriber): () => void {
    void this.throwTypeErrorIfInvalidSubscriber_(subscriber, namespace);
    void this.seekNode_(namespace).registers.push([namespace, identifier, false, data => subscriber(data)]);
    return () => this.off(namespace, identifier);
  }
  public off(namespace: T, subscriber?: Subscriber<D, R>): void {
    switch (typeof subscriber) {
      case 'function':
        return void this.seekNode_(namespace).registers
          .some(([, identifier], i, registers) => {
            if (subscriber !== identifier) return false;
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
        node.children = new Map();
        node.childrenNames = [];
        node.registers = [];
        return;
      }
      default:
        throw this.throwTypeErrorIfInvalidSubscriber_(subscriber, namespace);
    }
  }
  public once(namespace: T, subscriber: Subscriber<D, R>): () => void {
    void this.throwTypeErrorIfInvalidSubscriber_(subscriber, namespace);
    return this
      .on(
        namespace,
        data => (
          void this.off(namespace, subscriber),
          subscriber(data)),
        subscriber);
  }
  public emit(this: Observable<T, void | undefined, R>, type: T, data?: D, tracker?: (data: D, results: R[]) => any): void
  public emit(namespace: T, data: D, tracker?: (data: D, results: R[]) => any): void
  public emit(namespace: T, data: D, tracker?: (data: D, results: R[]) => any): void {
    void this.drain_(namespace, data, tracker);
  }
  public reflect(this: Observable<T, void | undefined, R>, type: T, data: D): R[]
  public reflect(namespace: T, data: D): R[]
  public reflect(namespace: T, data: D): R[] {
    let results: R[] = [];
    void this.emit(namespace, <D>data, (_, r) => results = r);
    assert(Array.isArray(results));
    return results;
  }
  private drain_(types: T, data: D, tracker?: (data: D, results: R[]) => any): void {
    const results: R[] = [];
    void this.refsBelow_(this.seekNode_(types))
      .reduce<void>((_, sub) => {
        const [, , monitor, subscriber] = sub;
        if (monitor) return;
        try {
          const result = subscriber(data);
          if (tracker) {
            results[results.length] = result;
          }
        }
        catch (reason) {
          if (reason !== void 0 && reason !== null) {
            void console.error(stringify(reason));
            assert(!console.info(reason + ''));
          }
        }
      }, void 0);
    void this.refsAbove_(this.seekNode_(types))
      .reduce<void>((_, sub) => {
        const [, , monitor, subscriber] = sub;
        if (!monitor) return;
        try {
          void subscriber(data);
        }
        catch (reason) {
          if (reason !== void 0 && reason !== null) {
            void console.error(stringify(reason));
            assert(!console.info(reason + ''));
          }
        }
      }, void 0);
    if (tracker) {
      try {
        void tracker(data, results);
      }
      catch (reason) {
        void console.error(stringify(reason));
        assert(!console.info(reason + ''));
      }
    }
  }
  public refs(namespace: never[] | T): [T, Subscriber<D, R>, boolean][] {
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
  private throwTypeErrorIfInvalidSubscriber_(subscriber: Subscriber<D, R> | undefined, types: T): void {
    switch (typeof subscriber) {
      case 'function':
        return;
      default:
        throw new TypeError(`Spica: Observable: Invalid subscriber.\n\t${types} ${subscriber}`);
    }
  }
}
