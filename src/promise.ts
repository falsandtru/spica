import { undefined, Array } from './global';
import { isArray } from './alias';
import { splice } from './array';

export const enum State {
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

export class Internal<T> {
  public status: Status<T> = { state: State.pending };
  public reactable: boolean = true;
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
  public static all<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(values: readonly [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>, T9 | PromiseLike<T9>, T10 | PromiseLike<T10>]): AtomicPromise<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]>;
  public static all<T1, T2, T3, T4, T5, T6, T7, T8, T9>(values: readonly [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>, T9 | PromiseLike<T9>]): AtomicPromise<[T1, T2, T3, T4, T5, T6, T7, T8, T9]>;
  public static all<T1, T2, T3, T4, T5, T6, T7, T8>(values: readonly [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>]): AtomicPromise<[T1, T2, T3, T4, T5, T6, T7, T8]>;
  public static all<T1, T2, T3, T4, T5, T6, T7>(values: readonly [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>]): AtomicPromise<[T1, T2, T3, T4, T5, T6, T7]>;
  public static all<T1, T2, T3, T4, T5, T6>(values: readonly [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>]): AtomicPromise<[T1, T2, T3, T4, T5, T6]>;
  public static all<T1, T2, T3, T4, T5>(values: readonly [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>]): AtomicPromise<[T1, T2, T3, T4, T5]>;
  public static all<T1, T2, T3, T4>(values: readonly [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>]): AtomicPromise<[T1, T2, T3, T4]>;
  public static all<T1, T2, T3>(values: readonly [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>]): AtomicPromise<[T1, T2, T3]>;
  public static all<T1, T2>(values: readonly [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>]): AtomicPromise<[T1, T2]>;
  public static all<T>(values: Iterable<T | PromiseLike<T>>): AtomicPromise<T[]>;
  public static all<T>(vs: Iterable<T | PromiseLike<T>>): AtomicPromise<T[]> {
    return new AtomicPromise<T[]>((resolve, reject) => {
      const values = isArray(vs) ? vs as T[] : [...vs];
      const results: T[] = Array(values.length);
      let count = 0;
      for (let i = 0; i < values.length; ++i) {
        const value = values[i];
        if (!isPromiseLike(value)) {
          results[i] = value;
          ++count;
        }
        else {
          value.then(
            value => {
              results[i] = value;
              ++count;
              count === values.length && resolve(results);
            },
            reason => {
              i = values.length;
              reject(reason);
            });
        }
      }
      count === values.length && resolve(results);
    });
  }
  public static race<T>(values: Iterable<T | PromiseLike<T>>): AtomicPromise<T> {
    return new AtomicPromise<T>((resolve, reject) => {
      let done = false;
      for (const value of values) {
        assert(!done);
        if (!isPromiseLike(value)) {
          done = true;
          resolve(value);
        }
        else {
          value.then(
            value => {
              done = true;
              resolve(value);
            },
            reason => {
              done = true;
              reject(reason);
            });
        }
        if (done) break;
      }
    });
  }
  public static resolve(): AtomicPromise<undefined>;
  public static resolve<T>(value: T | PromiseLike<T>): AtomicPromise<T>;
  public static resolve<T>(value?: T | PromiseLike<T>): AtomicPromise<T> {
    return new AtomicPromise<T>(resolve => resolve(value));
  }
  public static reject<T = never>(reason?: unknown): AtomicPromise<T> {
    return new AtomicPromise<T>((_, reject) => reject(reason));
  }
  constructor(
    executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: unknown) => void) => void,
  ) {
    try {
      executor(
        value => resolve(this[internal], value),
        reason => reject(this[internal], reason));
    }
    catch (reason) {
      reject(this[internal], reason);
    }
  }
  public readonly [internal]: Internal<T> = new Internal();
  public then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null): AtomicPromise<TResult1 | TResult2> {
    return new AtomicPromise((resolve, reject) =>
      then(this[internal], onfulfilled, onrejected, resolve, reject));
  }
  public catch<TResult = never>(onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | undefined | null): AtomicPromise<T | TResult> {
    return this.then(undefined, onrejected);
  }
  public finally(onfinally?: (() => void) | undefined | null): AtomicPromise<T> {
    return this.then(onfinally, onfinally).then(() => this);
  }
}

export function isPromiseLike(value: any): value is PromiseLike<any> {
  return value !== null && typeof value === 'object'
      && 'then' in value && typeof value.then === 'function';
}

export function resolve<T>(internal: Internal<T>, value: T): void {
  if (internal.status.state !== State.pending) return;
  if (!isPromiseLike(value)) {
    internal.status = {
      state: State.fulfilled,
      result: value!,
    };
    return void resume(internal);
  }
  else {
    internal.status = {
      state: State.resolved,
      result: value,
    };
    return void value.then(
      value => {
        assert(internal.status.state === State.resolved);
        internal.status = {
          state: State.fulfilled,
          result: value,
        };
        resume(internal);
      },
      reason => {
        assert(internal.status.state === State.resolved);
        internal.status = {
          state: State.rejected,
          result: reason,
        };
        resume(internal);
      });
  }
}

function reject(internal: Internal<unknown>, reason: unknown): void {
  if (internal.status.state !== State.pending) return;
  internal.status = {
    state: State.rejected,
    result: reason,
  };
  return void resume(internal);
}

export function then<T, TResult1, TResult2>(
  internal: Internal<T>,
  onfulfilled: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
  onrejected: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null,
  resolve: (value: TResult1 | TResult2 | PromiseLike<TResult1 | TResult2>) => void,
  reject: (reason: unknown) => void,
): void {
  const { status, fulfillReactions, rejectReactions } = internal;
  switch (status.state) {
    case State.fulfilled:
      if (fulfillReactions.length > 0) break;
      try {
        return onfulfilled
          ? resolve(onfulfilled(status.result))
          : resolve(status.result as any);
      }
      catch (reason) {
        return reject(reason);
      }
    case State.rejected:
      if (rejectReactions.length > 0) break;
      try {
        return onrejected
          ? resolve(onrejected(status.result))
          : reject(status.result);
      }
      catch (reason) {
        return reject(reason);
      }
  }
  if (status.state !== State.rejected) {
    fulfillReactions.push(value => {
      try {
        onfulfilled
          ? resolve(onfulfilled(value))
          : resolve(value as any);
      }
      catch (reason) {
        reject(reason);
      }
    });
  }
  if (status.state !== State.fulfilled) {
    rejectReactions.push(reason => {
      try {
        onrejected
          ? resolve(onrejected(reason))
          : reject(reason);
      }
      catch (reason) {
        reject(reason);
      }
    });
  }
  resume(internal);
}

export function resume<T>(internal: Internal<T>): void {
  if (!internal.reactable) return;
  const { status, fulfillReactions, rejectReactions } = internal;
  switch (status.state) {
    case State.pending:
    case State.resolved:
      return;
    case State.fulfilled:
      if (!internal.isHandled && rejectReactions.length > 0) {
        splice(rejectReactions, 0);
      }
      assert(rejectReactions.length === 0);
      if (fulfillReactions.length === 0) return;
      internal.isHandled = true;
      internal.reactable = false;
      react(fulfillReactions, status.result);
      internal.reactable = true;
      assert(fulfillReactions.length + rejectReactions.length === 0);
      return;
    case State.rejected:
      if (!internal.isHandled && fulfillReactions.length > 0) {
        splice(fulfillReactions, 0);
      }
      assert(fulfillReactions.length === 0);
      if (rejectReactions.length === 0) return;
      internal.isHandled = true;
      internal.reactable = false;
      react(rejectReactions, status.result);
      internal.reactable = true;
      assert(fulfillReactions.length + rejectReactions.length === 0);
      return;
  }
}

function react<T>(reactions: ((result: T) => void)[], result: T): void {
  if (reactions.length < 5) {
    while (reactions.length > 0) {
      reactions.shift()!(result);
    }
  }
  else {
    for (let i = 0; i < reactions.length; ++i) {
      reactions[i](result);
    }
    splice(reactions, 0);
  }
}
