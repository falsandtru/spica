import { Array } from './global';
import { isArray } from './alias';
import { noop } from './noop';

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

interface AggregateError extends Error {
  readonly errors: any[];
}

interface AggregateErrorConstructor {
  new(errors: Iterable<any>, message?: string): AggregateError;
  (errors: Iterable<any>, message?: string): AggregateError;
  readonly prototype: AggregateError;
}

declare var AggregateError: AggregateErrorConstructor;

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
              return reject(status.reason);
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
  public static any<T>(values: Iterable<T | PromiseLike<T>>): AtomicPromise<T>;
  public static any<T>(vs: Iterable<T | PromiseLike<T>>): AtomicPromise<T> {
    return new AtomicPromise<T>((resolve, reject) => {
      const values = isArray(vs) ? vs : [...vs];
      const reasons: unknown[] = Array(values.length);
      let count = 0;
      for (let i = 0; i < values.length; ++i) {
        const value = values[i];
        if (!isPromiseLike(value)) return resolve(value);
        if (isAtomicPromiseLike(value)) {
          const { status } = value[internal];
          switch (status.state) {
            case State.fulfilled:
              return resolve(status.value);
            case State.rejected:
              reasons[i] = status.reason;
              ++count;
              continue;
          }
        }
        (value as PromiseLike<T>).then(
          value => {
            resolve(value);
            i = values.length;
          },
          reason => {
            reasons[i] = reason;
            ++count;
            count === values.length && reject(new AggregateError(reasons, 'All promises were rejected'));
          });
      }
      count === values.length && reject(new AggregateError(reasons, 'All promises were rejected'));
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
        value => void this[internal].resolve(value),
        reason => void this[internal].reject(reason));
    }
    catch (reason) {
      this[internal].reject(reason);
    }
  }
  public readonly [internal]: Internal<T> = new Internal();
  public then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null): AtomicPromise<TResult1 | TResult2> {
    return new AtomicPromise((resolve, reject) =>
      this[internal].then(resolve, reject, onfulfilled, onrejected));
  }
  public catch<TResult = never>(onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | undefined | null): AtomicPromise<T | TResult> {
    return this.then(void 0, onrejected);
  }
  public finally(onfinally?: (() => void) | undefined | null): AtomicPromise<T> {
    return this.then(onfinally, onfinally).then(() => this);
  }
}

type FulfillReaction = [(value: unknown) => void, (reason: unknown) => void, (value: unknown) => void, ((param: unknown) => unknown) | undefined | null];
type RejectReaction = [(value: unknown) => void, (reason: unknown) => void, (reason: unknown) => void, ((param: unknown) => unknown) | undefined | null];

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
        value: value,
      };
      return this.resume();
    }
    if (isAtomicPromiseLike(value)) {
      const core: Internal<T> = value[internal];
      switch (core.status.state) {
        case State.fulfilled:
        case State.rejected:
          this.status = core.status;
          return this.resume();
        default:
          return core.then(
            () => (this.status = core.status, this.resume()),
            () => (this.status = core.status, this.resume()));
      }
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
          value,
        };
        this.resume();
      },
      reason => {
        assert(this.status.state === State.resolved);
        this.status = {
          state: State.rejected,
          reason,
        };
        this.resume();
      });
  }
  public reject(reason: unknown): void {
    if (this.status.state !== State.pending) return;
    this.status = {
      state: State.rejected,
      reason,
    };
    return this.resume();
  }
  public fulfillReactions: FulfillReaction[] = [];
  public rejectReactions: RejectReaction[] = [];
  public then<TResult1, TResult2>(
    resolve: (value: TResult1 | TResult2 | PromiseLike<TResult1 | TResult2>) => void,
    reject: (reason: unknown) => void,
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null,
  ): void {
    const { status, fulfillReactions, rejectReactions } = this;
    switch (status.state) {
      case State.fulfilled:
        if (fulfillReactions.length !== 0) break;
        return call(resolve, reject, resolve, onfulfilled, status.value);
      case State.rejected:
        if (rejectReactions.length !== 0) break;
        return call(resolve, reject, reject, onrejected, status.reason);
    }
    fulfillReactions.push([
      resolve,
      reject,
      resolve,
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
        if (rejectReactions.length !== 0) {
          this.rejectReactions = [];
        }
        if (fulfillReactions.length === 0) return;
        react(fulfillReactions, status.value);
        this.fulfillReactions = [];
        return;
      case State.rejected:
        if (fulfillReactions.length !== 0) {
          this.fulfillReactions = [];
        }
        if (rejectReactions.length === 0) return;
        react(rejectReactions, status.reason);
        this.rejectReactions = [];
        return;
    }
  }

}

function react(reactions: Array<FulfillReaction | RejectReaction>, param: unknown): void {
  for (let i = 0; i < reactions.length; ++i) {
    const reaction = reactions[i];
    call(
      reaction[0],
      reaction[1],
      reaction[2],
      reaction[3],
      param);
  }
}

function call(
  resolve: (value: unknown) => void,
  reject: (reason: unknown) => void,
  cont: (value: unknown) => void,
  callback: ((param: unknown) => unknown) | undefined | null,
  param: unknown,
): void {
  assert([resolve, reject].includes(cont));
  if (!callback) return cont(param);
  try {
    resolve(callback(param));
  }
  catch (reason) {
    reject(reason);
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

export const never: Promise<never> = new class Never extends Promise<never> {
  public static override get [Symbol.species]() {
    return Never;
  }
  constructor() {
    super(noop);
  }
  public override then() {
    return this;
  }
  public override catch() {
    return this;
  }
  public override finally() {
    return this;
  }
}();
