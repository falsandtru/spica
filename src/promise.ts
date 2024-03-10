import { isArray } from './alias';
import { noop } from './function';

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

export const internal = Symbol.for('spica/promise::internal');

interface AtomicPromiseLike<T> {
  readonly [internal]: Internal<T>;
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null): AtomicPromise<TResult1 | TResult2>;
}

export class AtomicPromise<T = undefined> implements Promise<T>, AtomicPromiseLike<T> {
  public readonly [Symbol.toStringTag]: string = 'Promise';
  public static get [Symbol.species]() {
    return AtomicPromise;
  }
  public static all<T extends readonly unknown[] | []>(values: T): AtomicPromise<{ -readonly [P in keyof T]: Awaited<T[P]> }>;
  public static all<T>(values: Iterable<T | PromiseLike<T>>): AtomicPromise<Awaited<T>[]>;
  public static all<T>(vs: Iterable<T | PromiseLike<T> | AtomicPromiseLike<T>>): AtomicPromise<T[]> {
    return new AtomicPromise<T[]>((resolve, reject) => {
      const values = isArray(vs) ? vs : [...vs];
      const results: T[] = Array(values.length);
      let done = false;
      let count = 0;
      for (let i = 0; !done && i < values.length; ++i) {
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
        value.then(
          value => {
            results[i] = value;
            ++count;
            count === values.length && resolve(results);
          },
          reason => {
            reject(reason);
            done = true;
          });
      }
      count === values.length && resolve(results);
    });
  }
  public static race<T extends readonly unknown[] | []>(values: T): AtomicPromise<Awaited<T[number]>>;
  public static race<T>(values: Iterable<T | PromiseLike<T>>): AtomicPromise<Awaited<T>>;
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
      for (let i = 0; !done && i < values.length; ++i) {
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
      }
    });
  }
  public static allSettled<T extends readonly unknown[] | []>(values: T): AtomicPromise<{ -readonly [P in keyof T]: PromiseSettledResult<Awaited<T[P]>> }>;
  public static allSettled<T>(values: Iterable<T>): AtomicPromise<PromiseSettledResult<Awaited<T>>[]>;
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
        value.then(
          value => {
            results[i] = {
              status: 'fulfilled',
              value: value,
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
  public static any<T extends readonly unknown[] | []>(values: T): AtomicPromise<Awaited<T[number]>>;
  public static any<T>(values: Iterable<T | PromiseLike<T>>): AtomicPromise<Awaited<T>>;
  public static any<T>(vs: Iterable<T | PromiseLike<T>>): AtomicPromise<T> {
    return new AtomicPromise<T>((resolve, reject) => {
      const values = isArray(vs) ? vs : [...vs];
      const reasons: unknown[] = Array(values.length);
      let done = false;
      let count = 0;
      for (let i = 0; !done && i < values.length; ++i) {
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
              reasons[i] = status.reason;
              ++count;
              continue;
          }
        }
        value.then(
          value => {
            resolve(value);
            done = true;
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
    const p = new AtomicPromise<T>(noop);
    p[internal].resolve(value!);
    return p;
  }
  public static reject<T = never>(reason?: unknown): AtomicPromise<T> {
    const p = new AtomicPromise<T>(noop);
    p[internal].reject(reason);
    return p;
  }
  constructor(
    executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: unknown) => void) => void,
  ) {
    if (executor === noop) return;
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
    const p = new AtomicPromise<TResult1 | TResult2>(noop);
    this[internal].then(p[internal], onfulfilled, onrejected);
    return p;
  }
  public catch<TResult = never>(onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | undefined | null): AtomicPromise<T | TResult> {
    return this.then(undefined, onrejected);
  }
  public finally(onfinally?: (() => void) | undefined | null): AtomicPromise<T> {
    return this.then(onfinally, onfinally).then(() => this);
  }
}

interface FulfillReaction {
  readonly internal: Internal<unknown>;
  readonly state: true;
  readonly procedure: ((param: unknown) => unknown) | undefined | null;
}
interface RejectReaction {
  readonly internal: Internal<unknown>;
  readonly state: false;
  readonly procedure: ((param: unknown) => unknown) | undefined | null;
}

export class Internal<T> {
  public status: Status<T> = { state: State.pending };
  public isPending(): boolean {
    return this.status.state === State.pending;
  }
  public resolve(value: T | PromiseLike<T>): void {
    if (!this.isPending()) return;
    if (!isPromiseLike(value)) {
      this.status = {
        state: State.fulfilled,
        value: value,
      };
      return this.resume();
    }
    if (isAtomicPromiseLike(value)) {
      return value[internal].then(this);
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
    if (!this.isPending()) return;
    this.status = {
      state: State.rejected,
      reason,
    };
    return this.resume();
  }
  public fulfillReactions: FulfillReaction[] = [];
  public rejectReactions: RejectReaction[] = [];
  public then<TResult1, TResult2>(
    internal: Internal<TResult1 | TResult2>,
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null,
  ): void {
    assert(internal);
    const { status, fulfillReactions, rejectReactions } = this;
    switch (status.state) {
      case State.fulfilled:
        if (fulfillReactions.length !== 0) break;
        return call(internal, true, onfulfilled, status.value);
      case State.rejected:
        if (rejectReactions.length !== 0) break;
        return call(internal, false, onrejected, status.reason);
    }
    fulfillReactions.push({
      internal,
      state: true,
      procedure: onfulfilled,
    });
    rejectReactions.push({
      internal,
      state: false,
      procedure: onrejected,
    });
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

function react(reactions: readonly (FulfillReaction | RejectReaction)[], param: unknown): void {
  for (let i = 0; i < reactions.length; ++i) {
    const { internal, state, procedure } = reactions[i];
    call(internal, state, procedure, param);
  }
}

function call(
  internal: Internal<unknown>,
  state: boolean,
  procedure: ((param: unknown) => unknown) | undefined | null,
  param: unknown,
): void {
  if (procedure == null) return state ? internal.resolve(param) : internal.reject(param);
  try {
    internal.resolve(procedure(param));
  }
  catch (reason) {
    internal.reject(reason);
  }
}

export function isPromiseLike(value: any): value is PromiseLike<any> {
  return value != null && typeof value === 'object'
      && 'then' in value && typeof value.then === 'function';
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
