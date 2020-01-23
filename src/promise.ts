import { concat } from './concat';

const enum State {
  pending,
  resolved,
  fulfilled,
  rejected,
}
type Status<T> =
  | { readonly state: State.pending;
    }
  | { readonly state: State.resolved;
      readonly result: PromiseLike<T>; 
    }
  | { readonly state: State.fulfilled;
      readonly result: T; 
    }
  | { readonly state: State.rejected;
      readonly result: unknown; 
    };

class Internal<T> {
  public status: Status<T> = { state: State.pending };
  public readonly fulfillReactions: ((value: T) => void)[] = [];
  public readonly rejectReactions: ((reason: unknown) => void)[] = [];
  public isHandled: boolean = false;
}

const internal = Symbol.for('spica/promise::internal');

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
  public static resolve(): AtomicPromise<undefined>;
  public static resolve<T>(value: T | PromiseLike<T>): AtomicPromise<T>;
  public static resolve<T>(value?: T | PromiseLike<T>): AtomicPromise<T> {
    return new AtomicPromise<T>(resolve => void resolve(value));
  }
  public static reject<T = never>(reason?: unknown): AtomicPromise<T> {
    return new AtomicPromise<T>((_, reject) => void reject(reason));
  }
  constructor(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: unknown) => void) => void) {
    const intl: typeof internal = internal;
    try {
      const internal = this[intl];
      void executor(
        value => {
          if (internal.status.state !== State.pending) return;
          if (isPromiseLike(value)) {
            internal.status = {
              state: State.resolved,
              result: value,
            };
            void value.then(
              value => {
                assert(internal.status.state === State.resolved);
                internal.status = {
                  state: State.fulfilled,
                  result: value,
                };
                void resume(internal);
              },
              reason => {
                assert(internal.status.state === State.resolved);
                internal.status = {
                  state: State.rejected,
                  result: reason,
                };
                void resume(internal);
              });
          }
          else {
            internal.status = {
              state: State.fulfilled,
              result: value!,
            };
            void resume(internal);
          }
        },
        reason => {
          if (internal.status.state !== State.pending) return;
          internal.status = {
            state: State.rejected,
            result: reason,
          };
          void resume(internal);
        });
    }
    catch (reason) {
      const internal = this[intl];
      if (internal.status.state !== State.pending) return;
      internal.status = {
        state: State.rejected,
        result: reason,
      };
      void resume(internal);
    }
  }
  public readonly [internal]: Internal<T> = new Internal();
  public then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null): AtomicPromise<TResult1 | TResult2> {
    return new AtomicPromise((resolve, reject) => {
      const { fulfillReactions, rejectReactions, status } = this[internal];
      if (status.state !== State.rejected) {
        void fulfillReactions.push(value => {
          if (!onfulfilled) return void resolve(value as any);
          try {
            void resolve(onfulfilled(value));
          }
          catch (reason) {
            void reject(reason);
          }
        });
      }
      if (status.state !== State.fulfilled) {
        void rejectReactions.push(reason => {
          if (!onrejected) return void reject(reason);
          try {
            void resolve(onrejected(reason));
          }
          catch (reason) {
            void reject(reason);
          }
        });
      }
      assert(status.state === State.fulfilled ? rejectReactions.length === 0 : true);
      assert(status.state === State.rejected ? fulfillReactions.length === 0 : true);
      void resume(this[internal]);
    });
  }
  public catch<TResult = never>(onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | undefined | null): AtomicPromise<T | TResult> {
    return this.then(undefined, onrejected);
  }
  public finally(onfinally?: (() => void) | undefined | null): AtomicPromise<T> {
    return this.then(onfinally, onfinally).then(() => this);
  }
}

function resume<T>(internal: Internal<T>): void {
  const { status, fulfillReactions, rejectReactions } = internal;
  switch (status.state) {
    case State.pending:
    case State.resolved:
      return;
    case State.fulfilled:
      if (rejectReactions.length > 0) {
        rejectReactions.length = 0;
      }
      internal.isHandled = internal.isHandled || fulfillReactions.length > 0;
      void consume(fulfillReactions, status.result);
      assert(fulfillReactions.length === 0);
      assert(rejectReactions.length === 0);
      return;
    case State.rejected:
      if (fulfillReactions.length > 0) {
        fulfillReactions.length = 0;
      }
      internal.isHandled = internal.isHandled || rejectReactions.length > 0;
      void consume(rejectReactions, status.result);
      assert(rejectReactions.length === 0);
      assert(fulfillReactions.length === 0);
      return;
  }
}

function consume<a>(fs: ((a: a) => void)[], a: a): void {
  while (fs.length > 0) {
    void fs.shift()!(a);
  }
}

export function isPromiseLike(value: any): value is PromiseLike<unknown> {
  return !!value && typeof value === 'object'
      && 'then' in value && typeof value.then === 'function';
}
