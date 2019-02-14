import { concat } from './concat';

export class AtomicPromise<T> implements Promise<T> {
  public static get [Symbol.species]() {
    return AtomicPromise;
  }
  public readonly [Symbol.toStringTag]: string = 'Promise';
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
  public static race<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>, T9 | PromiseLike<T9>, T10 | PromiseLike<T10>]): AtomicPromise<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 | T10>;
  public static race<T1, T2, T3, T4, T5, T6, T7, T8, T9>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>, T9 | PromiseLike<T9>]): AtomicPromise<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9>;
  public static race<T1, T2, T3, T4, T5, T6, T7, T8>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>]): AtomicPromise<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8>;
  public static race<T1, T2, T3, T4, T5, T6, T7>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>]): AtomicPromise<T1 | T2 | T3 | T4 | T5 | T6 | T7>;
  public static race<T1, T2, T3, T4, T5, T6>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>]): AtomicPromise<T1 | T2 | T3 | T4 | T5 | T6>;
  public static race<T1, T2, T3, T4, T5>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>]): AtomicPromise<T1 | T2 | T3 | T4 | T5>;
  public static race<T1, T2, T3, T4>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>]): AtomicPromise<T1 | T2 | T3 | T4>;
  public static race<T1, T2, T3>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>]): AtomicPromise<T1 | T2 | T3>;
  public static race<T1, T2>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>]): AtomicPromise<T1 | T2>;
  public static race<T>(values: (T | PromiseLike<T>)[]): AtomicPromise<T>;
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
  public static reject<T = never>(reason?: any): AtomicPromise<T> {
    return new AtomicPromise<T>((_, reject) => void reject(reason));
  }
  constructor(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) {
    void statuses.set(this, new Status());
    const status = statuses.get(this)!;
    try {
      void executor(
        value => {
          status.result = status.result || [State.resolved, value!];
          void status.resume();
        },
        reason => {
          status.result = status.result || [State.rejected, reason];
          void status.resume();
        });
    }
    catch (reason) {
      assert(!status.result);
      status.result = [State.rejected, reason];
      void status.resume();
    }
  }
  public then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): AtomicPromise<TResult1 | TResult2> {
    const status = statuses.get(this)!;
    return new AtomicPromise((resolve, reject) => {
      void status.queue.push([
        value => {
          if (!onfulfilled) return void resolve(value as any);
          try {
            void resolve(onfulfilled(value as T));
          }
          catch (reason) {
            void reject(reason);
          }
        },
        reason => {
          if (!onrejected) return void resolve(this as any);
          try {
            void resolve(onrejected(reason));
          }
          catch (reason) {
            void reject(reason);
          }
        },
      ]);
      void status.resume();
    });
  }
  public catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): AtomicPromise<T | TResult> {
    return this.then(undefined, onrejected);
  }
  public finally(onfinally?: (() => void) | undefined | null): AtomicPromise<T> {
    return this.then(onfinally, onfinally).then(() => this);
  }
}

const enum State {
  resolved,
  rejected,
}

const statuses = new WeakMap<AtomicPromise<unknown>, Status<unknown>>();
class Status<T> {
  public result?: [State.resolved, T | PromiseLike<T>] | [State.rejected, unknown];
  public readonly queue: [(value: T) => void, (reason: any) => void][] = [];
  public resume(): void {
    if (!this.result) return;
    const [state, value] = this.result!;
    while (this.queue.length > 0) {
      const [resolve, reject] = this.queue.shift()!;
      switch (state) {
        case State.resolved:
          isPromiseLike(value)
            ? void value.then(resolve, reject)
            : void resolve(value as T);
          continue;
        case State.rejected:
          void reject(value);
          continue;
      }
    }
  }
}

function isPromiseLike(value: any): value is PromiseLike<any> {
  return !!value && typeof value === 'object'
      && 'then' in value && typeof value.then === 'function';
}
