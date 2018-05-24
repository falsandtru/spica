import { noop } from './noop';

const value = Symbol();
const queue = Symbol();
const resume = Symbol();

export class AtomicPromise<T> implements PromiseLike<T> {
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
    return values.reduce<AtomicPromise<T[]>>((acc, p) =>
      acc.then(vs => AtomicPromise.resolve(p).then(value => vs.concat([value])))
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
    return new AtomicPromise<T>(resolve =>
      void values.forEach(p =>
        void AtomicPromise.resolve(p).then(resolve, resolve)));
  }
  public static resolve(): AtomicPromise<void>;
  public static resolve<T>(value: T | PromiseLike<T>): AtomicPromise<T>;
  public static resolve<T>(value?: T | PromiseLike<T>): AtomicPromise<T> {
    return new AtomicPromise<T>((resolve, reject) =>
      isPromiseLike(value)
        ? void value.then(resolve, reject)
        : void resolve(value));
  }
  public static reject<T = never>(reason?: any): AtomicPromise<T> {
    return new AtomicPromise<T>((_, reject) => void reject(reason));
  }
  constructor(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) {
    try {
      void executor(
        val => {
          this[value] = this[value] || new PromiseValue('resolved', val!);
          void this[resume]();
        },
        reason => {
          this[value] = this[value] || new PromiseValue('rejected', reason);
          void this[resume]();
        });
    }
    catch (reason) {
      assert(!this[value]);
      this[value] = new PromiseValue('rejected', reason);
      void this[resume]();
    }
  }
  private [value]: PromiseValue<T | PromiseLike<T>> | undefined;
  private [resume](): void {
    const val = this[value];
    if (!val) return;
    while (this[queue].length > 0) {
      const [resolve, reject] = this[queue].shift()!;
      switch (val.state) {
        case 'resolved':
          isPromiseLike(val.value)
            ? void val.value.then(resolve, reject)
            : void resolve(val.value);
          continue;
        case 'rejected':
          void reject(val.value);
          continue;
      }
    }
  }
  private readonly [queue]: [(value: T) => void, (reason: any) => void][] = [];
  public then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): AtomicPromise<TResult1 | TResult2> {
    onfulfilled = onfulfilled || AtomicPromise.resolve;
    onrejected = onrejected || AtomicPromise.reject;
    return new AtomicPromise((resolve, reject) => {
      void this[queue].push([
        value => {
          try {
            void resolve(onfulfilled!(value));
          }
          catch (reason) {
            void reject(reason);
          }
        },
        reason =>
          void new AtomicPromise<TResult1 | TResult2>(resolve =>
            void resolve(onrejected!(reason)))
            .then(resolve, reject)
      ]);
      void this[resume]();
    });
  }
  public catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): AtomicPromise<T | TResult> {
    return this.then(undefined, onrejected);
  }
  public finally(onfinally?: (() => void) | undefined | null): AtomicPromise<T> {
    onfinally = onfinally || noop;
    return this.then(
      value => void onfinally!() || value,
      reason => void onfinally!() || AtomicPromise.reject(reason));
  }
}

class PromiseValue<T> {
  constructor(
    public state: 'resolved' | 'rejected',
    public value: typeof state extends 'resolved' ? T : any,
  ) {
  }
}

function isPromiseLike(value: any): value is PromiseLike<any> {
  return !!value
      && typeof value === 'object'
      && 'then' in value && typeof value.then === 'function';
}
