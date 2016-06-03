import {Observer, Publisher} from 'spica';
import {concat} from './concat';

interface SubscriberMapNode<T, D, R> {
  parent: SubscriberMapNode<T, D, R>;
  childrenMap: SubscriberMap<T, D, R>;
  childrenList: string[];
  registers: Register<T, D, R>[];
}
interface SubscriberMap<T, D, R> {
  [ns: string]: SubscriberMapNode<T, D, R>;
}
type Register<T, D, R> = [
  T,
  Subscriber<D, R>,
  boolean,
  Subscriber<D, R>
];
type Subscriber<D, R> = (data: D) => R;

export class Observable<T extends Array<string | number>, D, R>
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
      case 'function': {
        void this.seekNode_(namespace).registers
          .some(([, identifier], i, registers) => {
            if (subscriber !== identifier) return false;
            switch (i) {
              case 0: {
                return !void registers.shift();
              }
              case registers.length - 1: {
                return !void registers.pop();
              }
              default: {
                return !void registers.splice(i, 1);
              }
            }
          });
        return;
      }
      case 'undefined': {
        const node = this.seekNode_(namespace);
        node.childrenMap = Object.create(null);
        node.childrenList = [];
        node.registers = [];
        return;
      }
      default: {
        throw this.throwTypeErrorIfInvalidSubscriber_(subscriber, namespace);
      }
    }
  }
  public once(namespace: T, subscriber: Subscriber<D, R>): () => void {
    void this.throwTypeErrorIfInvalidSubscriber_(subscriber, namespace);
    return this.on(namespace, (data: D) => {
      void this.off(namespace, subscriber);
      return subscriber(data);
    }, subscriber);
  }
  public emit(namespace: T, data: D, tracker?: (data: D, results: R[]) => any): void {
    void this.drain_(namespace, data, tracker);
  }
  public reflect(namespace: T, data: D): R[] {
    let results: R[];
    void this.emit(namespace, <D>data, (_, r) => results = r);
    assert(results instanceof Array);
    return results;
  }
  private drain_(types: T, data: D, tracker?: (data: D, results: R[]) => any): void {
    const results: any[] = [];
    void this.refsBelow_(this.seekNode_(types))
      .reduce((_, sub) => {
        const [, , monitor, subscriber] = sub;
        if (monitor) return;
        try {
          const result = subscriber(data);
          if (tracker) {
            results[results.length] = result;
          }
        }
        catch (err) {
          if (err !== void 0 && err !== null) {
            void console.error(err + '');
            assert(!console.info(err + ''));
          }
        }
      }, void 0);
    void this.refsAbove_(this.seekNode_(types))
      .reduce((_, sub) => {
        const [, , monitor, subscriber] = sub;
        if (!monitor) return;
        try {
          void subscriber(data);
        }
        catch (err) {
          if (err !== void 0 && err !== null) {
            void console.error(err);
            assert(!console.info(err + ''));
          }
        }
      }, void 0);
    if (tracker) {
      try {
        void tracker(data, results);
      }
      catch (err) {
        void console.error(err);
        assert(!console.info(err + ''));
      }
    }
  }
  public refs(namespace: T): [T, Subscriber<D, R>, boolean][] {
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
  private refsBelow_({childrenList, childrenMap, registers}: SubscriberMapNode<T, D, R>): Register<T, D, R>[] {
    registers = concat([], registers);
    for (let i = 0; i < childrenList.length; ++i) {
      const name = childrenList[i];
      const below = this.refsBelow_(childrenMap[name]);
      registers = concat(registers, below);
      if (below.length === 0) {
        void delete childrenMap[name];
        void childrenList.splice(childrenList.indexOf(name), 1);
        void --i;
      }
    }
    return registers;
  }
  private node_: SubscriberMapNode<T, D, R> = {
    parent: void 0,
    childrenMap: Object.create(null),
    childrenList: [],
    registers: []
  };
  private seekNode_(types: T): SubscriberMapNode<T, D, R> {
    let node = this.node_;
    for (const type of types) {
      const {childrenMap} = node;
      assert(childrenMap.constructor === void 0);
      if (!childrenMap[type + '']) {
        void node.childrenList.push(type + '');
        node.childrenList = node.childrenList.sort();
        childrenMap[type + ''] = {
          parent: node,
          childrenMap: <SubscriberMap<T, D, R>>Object.create(null),
          childrenList: [],
          registers: <Register<T, D, R>[]>[]
        };
      }
      node = childrenMap[type + ''];
    }
    return node;
  }
  private throwTypeErrorIfInvalidSubscriber_(subscriber: Subscriber<D, R>, types: T): void {
    switch (typeof subscriber) {
      case 'function': {
        return;
      }
      default: {
        throw new TypeError(`Spica: Observable: Invalid subscriber.\n\t${types, subscriber}`);
      }
    }
  }
}
