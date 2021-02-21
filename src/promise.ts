import { Array } from './global';
import { isArray } from './alias';

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
      readonly promise: PromiseLike<T>;
    }
  | { readonly state: State.fulfilled;
      readonly value: T;
    }
  | { readonly state: State.rejected;
      readonly reason: unknown;
    };

const internal = Symbol.for('spica/promise::internal');


interface PromiseFulfilledResult<T> {
  status: "fulfilled";
  value: T;
}

interface PromiseRejectedResult {
  status: "rejected";
  reason: unknown;
}

export type PromiseSettledResult<T> = PromiseFulfilledResult<T> | PromiseRejectedResult;

interface AtomicPromiseLike<T> {
  readonly [internal]: Internal<T>;
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null): AtomicPromise<TResult1 | TResult2>;
}

export class AtomicPromise<T = undefined> implements Promise<T>, AtomicPromiseLike<T> {
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
  public static all<T>(vs: Iterable<T | PromiseLike<T> | AtomicPromiseLike<T>>): AtomicPromise<T[]> {
    return new AtomicPromise<T[]>((resolve, reject) => {
      const values = isArray(vs) ? vs : [...vs];
      const results: T[] = Array(values.length);
      let count = 0;
      for (let i = 0; i < values.length; ++i) {
        const value = values[i];
        if (!isPromiseLike(value)) {
          results[i] = value;
          ++count;
          continue;
        }
        if (isAtomicPromiseLike(value)) {
          const { status } = value[internal];
          switch (status.state) {
            case State.fulfilled:
              results[i] = status.value;
              ++count;
              continue;
            case State.rejected:
              reject(status.reason);
              i = values.length;
              continue;
          }
        }
        (value as PromiseLike<T>).then(
          value => {
            results[i] = value;
            ++count;
            count === values.length && resolve(results);
          },
          reason => {
            reject(reason);
            i = values.length;
          });
      }
      count === values.length && resolve(results);
    });
  }
  public static race<T>(values: Iterable<T | PromiseLike<T>>): AtomicPromise<T>;
  public static race<T>(vs: Iterable<T | PromiseLike<T> | AtomicPromiseLike<T>>): AtomicPromise<T> {
    return new AtomicPromise<T>((resolve, reject) => {
      const values = isArray(vs) ? vs : [...vs];
      for (let i = 0; i < values.length; ++i) {
        const value = values[i];
        if (!isPromiseLike(value)) {
          return resolve(value);
        }
        if (isAtomicPromiseLike(value)) {
          const { status } = value[internal];
          switch (status.state) {
            case State.fulfilled:
              return resolve(status.value);
            case State.rejected:
              return reject(status.reason);
          }
        }
      }
      let done = false;
      for (let i = 0; i < values.length; ++i) {
        const value = values[i] as PromiseLike<T>;
        value.then(
          value => {
            resolve(value);
            done = true;
          },
          reason => {
            reject(reason);
            done = true;
          });
        if (done) return;
      }
    });
  }
  public static allSettled<T extends readonly unknown[] | readonly [unknown]>(values: T):
    AtomicPromise<{ -readonly [P in keyof T]: PromiseSettledResult<T[P] extends PromiseLike<infer U> ? U : T[P]> }>;
  public static allSettled<T>(values: Iterable<T>): AtomicPromise<PromiseSettledResult<T extends PromiseLike<infer U> ? U : T>[]>;
  public static allSettled<T>(vs: Iterable<T>): AtomicPromise<unknown> {
    return new AtomicPromise<PromiseSettledResult<T extends PromiseLike<infer U> ? U : T>[]>(resolve => {
      const values = isArray(vs) ? vs : [...vs];
      const results: PromiseSettledResult<T extends PromiseLike<infer U> ? U : T>[] = Array(values.length);
      let count = 0;
      for (let i = 0; i < values.length; ++i) {
        const value = values[i];
        if (!isPromiseLike(value)) {
          results[i] = {
            status: 'fulfilled',
            value: value as any,
          };
          ++count;
          continue;
        }
        if (isAtomicPromiseLike(value)) {
          const { status } = value[internal];
          switch (status.state) {
            case State.fulfilled:
              results[i] = {
                status: 'fulfilled',
                value: status.value,
              };
              ++count;
              continue;
            case State.rejected:
              results[i] = {
                status: 'rejected',
                reason: status.reason,
              };
              ++count;
              continue;
          }
        }
        (value as PromiseLike<T>).then(
          value => {
            results[i] = {
              status: 'fulfilled',
              value: value as any,
            };
            ++count;
            count === values.length && resolve(results);
          },
          reason => {
            results[i] = {
              status: 'rejected',
              reason,
            };
            ++count;
            count === values.length && resolve(results);
          });
      }
      count === values.length && resolve(results);
    });
  }
  public static resolve(): AtomicPromise<undefined>;
  public static resolve<T>(value: T | PromiseLike<T>): AtomicPromise<T>;
  public static resolve<T>(value?: T | PromiseLike<T>): AtomicPromise<T> {
    return new AtomicPromise<T>(resolve => resolve(value!));
  }
  public static reject<T = never>(reason?: unknown): AtomicPromise<T> {
    return new AtomicPromise<T>((_, reject) => reject(reason));
  }
  constructor(
    executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: unknown) => void) => void,
  ) {
    try {
      executor(
        value => this[internal].resolve(value!),
        reason => this[internal].reject(reason));
    }
    catch (reason) {
      this[internal].reject(reason);
    }
  }
  public readonly [internal]: Internal<T> = new Internal();
  public then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null): AtomicPromise<TResult1 | TResult2> {
    return new AtomicPromise((resolve, reject) =>
      this[internal].then(onfulfilled, onrejected, resolve, reject));
  }
  public catch<TResult = never>(onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | undefined | null): AtomicPromise<T | TResult> {
    return this.then(void 0, onrejected);
  }
  public finally(onfinally?: (() => void) | undefined | null): AtomicPromise<T> {
    return this.then(onfinally, onfinally).then(() => this);
  }
}

export class Internal<T> {
  public status: Status<T> = { state: State.pending };
  public get isPending(): boolean {
    return this.status.state === State.pending;
  }
  public resolve(value: T | PromiseLike<T>): void {
    if (this.status.state !== State.pending) return;
    if (!isPromiseLike(value)) {
      this.status = {
        state: State.fulfilled,
        value: value!,
      };
      return this.resume();
    }
    this.status = {
      state: State.resolved,
      promise: value,
    };
    return void value.then(
      value => {
        assert(this.status.state === State.resolved);
        this.status = {
          state: State.fulfilled,
          value: value,
        };
        this.resume();
      },
      reason => {
        assert(this.status.state === State.resolved);
        this.status = {
          state: State.rejected,
          reason: reason,
        };
        this.resume();
      });
  }
  public reject(reason: unknown): void {
    if (this.status.state !== State.pending) return;
    this.status = {
      state: State.rejected,
      reason: reason,
    };
    return this.resume();
  }
  public fulfillReactions: [(value: unknown) => void, (value: unknown) => void, (reason: unknown) => void, ((param: unknown) => unknown) | undefined | null][] = [];
  public rejectReactions: [(value: unknown) => void, (reason: unknown) => void, (reason: unknown) => void, ((param: unknown) => unknown) | undefined | null][] = [];
  public then<TResult1, TResult2>(
    onfulfilled: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null,
    resolve: (value: TResult1 | TResult2 | PromiseLike<TResult1 | TResult2>) => void,
    reject: (reason: unknown) => void,
  ): void {
    const { status, fulfillReactions, rejectReactions } = this;
    switch (status.state) {
      case State.fulfilled:
        if (fulfillReactions.length > 0) break;
        try {
          return onfulfilled
            ? resolve(onfulfilled(status.value))
            : resolve(status.value as any);
        }
        catch (reason) {
          return reject(reason);
        }
      case State.rejected:
        if (rejectReactions.length > 0) break;
        try {
          return onrejected
            ? resolve(onrejected(status.reason))
            : reject(status.reason);
        }
        catch (reason) {
          return reject(reason);
        }
    }
    fulfillReactions.push([
      resolve,
      resolve,
      reject,
      onfulfilled,
    ]);
    rejectReactions.push([
      resolve,
      reject,
      reject,
      onrejected,
    ]);
  }
  public resume(): void {
    const { status, fulfillReactions, rejectReactions } = this;
    switch (status.state) {
      case State.pending:
      case State.resolved:
        return;
      case State.fulfilled:
        if (rejectReactions.length > 0) {
          this.rejectReactions = [];
        }
        if (fulfillReactions.length === 0) return;
        this.react(fulfillReactions, status.value);
        this.fulfillReactions = [];
        return;
      case State.rejected:
        if (fulfillReactions.length > 0) {
          this.fulfillReactions = [];
        }
        if (rejectReactions.length === 0) return;
        this.react(rejectReactions, status.reason);
        this.rejectReactions = [];
        return;
    }
  }
  public react<T>(reactions: this['fulfillReactions'], param: T): void {
    for (let i = 0; i < reactions.length; ++i) {
      const reaction = reactions[i];
      try {
        reaction[3]
          ? reaction[0](reaction[3](param))
          : reaction[1](param);
      }
      catch (reason) {
        reaction[2](reason);
      }
    }
  }
}

export function isPromiseLike(value: any): value is PromiseLike<any> {
  return value !== null && typeof value === 'object'
      && typeof value.then === 'function';
}

function isAtomicPromiseLike(value: any): value is AtomicPromiseLike<any> {
  assert(isPromiseLike(value));
  return internal in value;
}
