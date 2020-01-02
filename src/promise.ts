import { concat } from './concat';

const enum State {
  pending,
  fulfilled,
  rejected,
}
type Status<T> =
  | { readonly state: State.pending; }
  | { readonly state: State.fulfilled; readonly result: T | PromiseLike<T>; }
  | { readonly state: State.rejected; readonly result: unknown; };
type QueueEntity<T> = readonly [(value: T) => void, (reason: unknown) => void];

const status = Symbol.for('spica/promise::status');
const queue = Symbol.for('spica/promise::queue');

export class AtomicPromise<T = undefined> implements Promise<T> {
  public static get [Symbol.species]() {
    return AtomicPromise;
  }
  public readonly [Symbol.toStringTag] = 'Promise';
  public static all<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>, T9 | PromiseLike<T9>, T10 | PromiseLike<T10>]): AtomicPromise<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]>;
  public static all<T1, T2, T3, T4, T5, T6, T7, T8, T9>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>, T9 | PromiseLike<T9>]): AtomicPromise<[T1, T2, T3, T4, T5, T6, T7, T8, T9]>;
  public static all<T1, T2, T3, T4, T5, T6, T7, T8>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>]): AtomicPromise<[T1, T2, T3, T4, T5, T6, T7, T8]>;
  public static all<T1, T2, T3, T4, T5, T6, T7>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>]): AtomicPromise<[T1, T2, T3, T4, T5, T6, T7]>;
  public static all<T1, T2, T3, T4, T5, T6>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>]): AtomicPromise<[T1, T2, T3, T4, T5, T6]>;
  public static all<T1, T2, T3, T4, T5>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>, T5 | PromiseLike<T5>]): AtomicPromise<[T1, T2, T3, T4, T5]>;
  public static all<T1, T2, T3, T4>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>]): AtomicPromise<[T1, T2, T3, T4]>;
  public static all<T1, T2, T3>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>]): AtomicPromise<[T1, T2, T3]>;
  public static all<T1, T2>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>]): AtomicPromise<[T1, T2]>;
  public static all<T>(values: (T | PromiseLike<T>)[]): AtomicPromise<T[]>;
  public static all<T>(values: (T | PromiseLike<T>)[]): AtomicPromise<T[]> {
    return values.reduce<AtomicPromise<T[]>>((acc, value) =>
      acc.then(vs => AtomicPromise.resolve(value).then(value => concat(vs, [value])))
    , AtomicPromise.resolve([]));
  }
  public static race<T>(values: (T | PromiseLike<T>)[]): AtomicPromise<T> {
    return new AtomicPromise<T>((resolve, reject) => {
      for (const value of values) {
        void AtomicPromise.resolve(value).then(resolve, reject);
      }
    });
  }
  public static resolve(): AtomicPromise<void>;
  public static resolve<T>(value: T | PromiseLike<T>): AtomicPromise<T>;
  public static resolve<T>(value?: T | PromiseLike<T>): AtomicPromise<T> {
    return new AtomicPromise<T>(resolve => void resolve(value));
  }
  public static reject<T = never>(reason?: unknown): AtomicPromise<T> {
    return new AtomicPromise<T>((_, reject) => void reject(reason));
  }
  constructor(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: unknown) => void) => void) {
    try {
      void executor(
        value => {
          if (this[status].state === State.pending) {
            // @ts-ignore
            this[status].state = State.fulfilled;
            // @ts-ignore
            this[status].result = value;
          }
          void process(this[status], this[queue]);
        },
        reason => {
          if (this[status].state === State.pending) {
            // @ts-ignore
            this[status].state = State.rejected;
            // @ts-ignore
            this[status].result = reason;
          }
          void process(this[status], this[queue]);
        });
    }
    catch (reason) {
      if (this[status].state === State.pending) {
        // @ts-ignore
        this[status].state = State.rejected;
        // @ts-ignore
        this[status].result = reason;
      }
      void process(this[status], this[queue]);
    }
  }
  public readonly [status]: Status<T> = { state: State.pending };
  public readonly [queue]: QueueEntity<T>[] = [];
  public then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null): AtomicPromise<TResult1 | TResult2> {
    return new AtomicPromise((resolve, reject) => {
      void this[queue].push([
        value => {
          if (!onfulfilled) return void resolve(value as any);
          try {
            void resolve(onfulfilled(value));
          }
          catch (reason) {
            void reject(reason);
          }
        },
        reason => {
          if (!onrejected) return void reject(reason);
          try {
            void resolve(onrejected(reason));
          }
          catch (reason) {
            void reject(reason);
          }
        },
      ]);
      void process(this[status], this[queue]);
    });
  }
  public catch<TResult = never>(onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | undefined | null): AtomicPromise<T | TResult> {
    return this.then(undefined, onrejected);
  }
  public finally(onfinally?: (() => void) | undefined | null): AtomicPromise<T> {
    return this.then(onfinally, onfinally).then(() => this);
  }
}

function process<T>(status: Status<T>, queue: QueueEntity<T>[]): void {
  switch (status.state) {
    case State.pending:
      return;
    case State.fulfilled:
      if (isPromiseLike(status.result)) {
        return void status.result.then(
          value => {
            while (queue.length > 0) {
              void queue.shift()![0](value);
            }
          },
          reason => {
            while (queue.length > 0) {
              void queue.shift()![1](reason);
            }
          });
      }
      while (queue.length > 0) {
        void queue.shift()![0](status.result);
      }
      return;
    case State.rejected:
      while (queue.length > 0) {
        void queue.shift()![1](status.result);
      }
      return;
  }
}

function isPromiseLike(value: any): value is PromiseLike<unknown> {
  return !!value && typeof value === 'object'
      && 'then' in value && typeof value.then === 'function';
}
