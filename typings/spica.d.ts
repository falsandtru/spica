/**
*
* spica.d.ts
*
* @author falsandtru https://github.com/falsandtru/spica
*/

declare module 'spica' {
  export namespace Supervisor {
    export namespace Event {
      export namespace Data {
        export type Exec<T extends string[], D, R> = [T, (data: D) => R];
        export type Fail<T extends string[], D, R> = [T, (data: D) => R, D];
        export type Loss<T extends string[], D, R> = [T, (data: D) => R, D];
        export type Exit<T extends string[], D, R> = [T, (data: D) => R, any];
      }
    }
  }
  export abstract class Supervisor<T extends string[], D, R> {
    static count: number;
    static procs: number;
    constructor(settings?: SupervisorSettings<T>)
    name: string;
    events: {
      exec: Observer<T, Supervisor.Event.Data.Exec<T, D, R>, any>;
      fail: Observer<T, Supervisor.Event.Data.Fail<T, D, R>, any>;
      loss: Observer<T, Supervisor.Event.Data.Loss<T, D, R>, any>;
      exit: Observer<T, Supervisor.Event.Data.Exit<T, D, R>, any>;
    };
    register(namespace: T, process: (data: D) => R): (reason?: any) => void;
    call(namespace: T, data: D, timeout?: number, callback?: (results: R[], data: D) => any): void;
    cast(namespace: T, data: D, retry?: boolean): R[];
    refs(namespace: T): [T, (data: D) => R, (reason: any) => void][];
    terminate(namespace?: T, reason?: any): void;
  }
  export interface SupervisorSettings<T> {
    name?: string;
    dependencies?: [T, T[]][];
    retry?: boolean;
    timeout?: number;
    destructor?: (reason?: any) => any;
  }

  export class Observable<T extends Array<string | number>, D, R>
    implements Observer<T, D, R>, Publisher<T, D, R> {
    monitor(type: T, subscriber: Subscriber<D, R>): () => void;
    on(type: T, subscriber: Subscriber<D, R>): () => void;
    off(type: T, subscriber?: Subscriber<D, R>): void;
    once(type: T, subscriber: Subscriber<D, R>): () => void;
    emit(type: T, data: D, tracker?: (data: D, results: R[]) => any): void;
    reflect(type: T, data: D): R[];
    refs(type: T): [T, Subscriber<D, R>, boolean][];
  }
  export interface Observer<T extends Array<string | number>, D, R> {
    monitor(type: T, subscriber: Subscriber<D, R>): () => void;
    on(type: T, subscriber: Subscriber<D, R>): () => void;
    off(type: T, subscriber?: Subscriber<D, R>): void;
    once(type: T, subscriber: Subscriber<D, R>): () => void;
  }
  export interface Publisher<T extends Array<string | number>, D, R> {
    emit(type: T, data: D, tracker?: (data: D, results: any[]) => any): void;
    reflect(type: T, data: D): R[];
  }
  export interface Subscriber<D, R> {
    (data: D): R;
  }

  export class Cancelable<L> {
    cancel: (reason: L) => void;
    promise: <T>(val: T) => Promise<T>;
    maybe: <T>(val: T) => Maybe<T>;
    either: <R>(val: R) => Either<L, R>;
  }

  abstract class Lazy<T> {
  }
  abstract class Functor<T> extends Lazy<T> {
    abstract fmap<U>(f: (val: T) => U): Functor<U>;
  }
  abstract class Monad<T> extends Functor<T> {
    abstract bind<U>(f: (val: T) => Monad<U>): Monad<U>;
  }
  namespace Monad {
    export function Return<T>(val: T): Monad<T>;
  }
  abstract class MonadPlus<T> extends Monad<T> {
    static mzero: MonadPlus<any>;
    static mplus<T>(a: MonadPlus<T>, b: MonadPlus<T>): MonadPlus<T>;
  }

  export class Sequence<T, S> extends MonadPlus<T> {
    static from<T>(as: T[]): Sequence<T, number>;
    static write<T>(as: T[]): Sequence<T, T[]>;
    static random(): Sequence<number, number>;
    static random<T>(gen: () => T): Sequence<T, number>;
    static random<T>(as: T[]): Sequence<T, Sequence.Iterator<number>>;
    static zip<T, U>(a: Sequence<T, any>, b: Sequence<U, any>): Sequence<[T, U], [Sequence.Iterator<T>, Sequence.Iterator<U>]>;
    static concat<T>(as: Sequence<Sequence<T, any>, any>): Sequence<T, [Sequence.Iterator<Sequence<T, any>>, Sequence.Iterator<T>]>;
    static union<T>(cmp: (a: T, b: T) => number, as: Sequence<T, any>[]): Sequence<T, [Sequence.Iterator<T>, Sequence.Iterator<T>]>;
    static intersect<T>(cmp: (a: T, b: T) => number, as: Sequence<T, any>[]): Sequence<T, [Sequence.Iterator<T>, Sequence.Iterator<T>]>;
    static Return<T>(a: T): Sequence<T, number>;
    static mempty: Sequence<any, any>;
    static mappend<T>(a: Sequence<T, any>, b: Sequence<T, any>): Sequence<T, [Sequence.Iterator<T>, Sequence.Iterator<T>]>;
    static mconcat<T>(as: Sequence<T, any>[]): Sequence<T, [Sequence.Iterator<T>, Sequence.Iterator<T>]>;
    static mzero: Sequence<any, any>;
    static mplus<T>(a: Sequence<T, any>, b: Sequence<T, any>): Sequence<T, [Sequence.Iterator<T>, Sequence.Iterator<T>]>;
    constructor(cons: (p: S, cons: (value?: T, next?: S) => Sequence.Data<T, S>) => Sequence.Data<T, S>);
    iterate(): Sequence.Thunk<T>;
    read(): T[];
    fmap<U>(f: (p: T) => U): Sequence<U, Sequence.Iterator<T>>;
    bind<U>(f: (p: T) => Sequence<U, any>): Sequence<U, [Sequence.Iterator<Sequence<U, any>>, Sequence.Iterator<U>]>;
    mapM<U>(f: (p: T) => Sequence<U, any>): Sequence<U[], [Sequence.Iterator<Sequence<U[], any>>, Sequence.Iterator<U[]>]>;
    filterM(f: (p: T) => Sequence<boolean, any>): Sequence<T[], [Sequence.Iterator<Sequence<T[], any>>, Sequence.Iterator<T[]>]>;
    map<U>(f: (p: T, i: number) => U): Sequence<U, Sequence.Iterator<T>>;
    filter(f: (p: T, i: number) => boolean): Sequence<T, Sequence.Iterator<T>>;
    scan<U>(f: (b: U, a: T) => U, z: U): Sequence<U, [U, Sequence.Iterator<T>]>;
    take(n: number): Sequence<T, Sequence.Iterator<T>>;
    drop(n: number): Sequence<T, Sequence.Iterator<T>>;
    takeWhile(f: (p: T) => boolean): Sequence<T, Sequence.Iterator<T>>;
    dropWhile(f: (p: T) => boolean): Sequence<T, Sequence.Iterator<T>>;
    takeUntil(f: (p: T) => boolean): Sequence<T, Sequence.Iterator<T>>;
    dropUntil(f: (p: T) => boolean): Sequence<T, Sequence.Iterator<T>>;
    memoize(memory?: Map<number, Sequence.Data<T, S>>): Sequence<T, S>;
  }
  export namespace Sequence {
    export type Data<T, S> = [T, S];
    export type Thunk<T> = [T, Iterator<T>, number];
    export type Iterator<T> = () => Thunk<T>;
  }

  namespace Monad {
    export abstract class Maybe<T> extends MonadPlus<T> {
      protected MAYBE: Just<T> | Nothing;
      fmap<U>(f: (val: T) => U): Maybe<U>;
      bind<U>(f: (val: T) => Maybe<U>): Maybe<U>;
      extract(): T;
      extract<U>(transform: () => U): T | U;
    }
  }
  namespace Monad.Maybe {
    export class Maybe<T> extends Monad.Maybe<T> {
    }
    export namespace Maybe {
      export function Return<T>(val: T): Maybe<T>;
      export const mzero: Maybe<any>;
      export function mplus<T>(a: Maybe<T>, b: Maybe<T>): Maybe<T>;
    }
    export class Just<T> extends Maybe<T> {
      protected MAYBE: Just<T>;
      bind<U>(f: (val: T) => Maybe<U>): Maybe<U>;
      extract<U>(transform?: () => U): T;
    }
    export class Nothing extends Maybe<any> {
      protected MAYBE: Nothing;
      bind(f: (val: any) => Maybe<any>): Nothing;
      extract(): any;
      extract<U>(transform: () => U): U;
    }
  }

  export namespace Maybe {
    export const Return: typeof Monad.Maybe.Maybe.Return;
    export const mzero: typeof Monad.Maybe.Maybe.mzero;
    export const mplus: typeof Monad.Maybe.Maybe.mplus;
    export type Just<T> = Monad.Maybe.Just<T>;
    export function Just<T>(val: T): Just<T>;
    export type Nothing = Monad.Maybe.Nothing;
    export const Nothing: Nothing;
  }

  export type Maybe<T> = Monad.Maybe<T>;
  export type Just<T> = Maybe.Just<T>;
  export const Just: typeof Maybe.Just;
  export type Nothing = Maybe.Nothing;
  export const Nothing: typeof Maybe.Nothing;

  namespace Monad {
    export abstract class Either<L, R> extends Monad<R> {
      protected EITHER: Left<L> | Right<R>;
      fmap<RR>(f: (val: R) => RR): Either<L, RR>;
      bind<RR>(f: (val: R) => Either<L, RR>): Either<L, RR>;
      extract(): R;
      extract<LL>(transform: (left: L) => LL): LL | R;
    }
  }
  namespace Monad.Either {
    export class Either<L, R> extends Monad.Either<L, R> {
    }
    export namespace Either {
      export function Return<R>(val: R): Right<R>;
    }
    export class Left<L> extends Either<L, any> {
      protected EITHER: Left<L>;
      bind(f: (val: any) => Either<L, any>): Left<L>;
      extract(): any;
      extract<LL>(transform: (left: L) => LL): LL;
    }
    export class Right<R> extends Either<any, R> {
      protected EITHER: Right<R>;
      bind<L>(f: (val: R) => Either<L, R>): Either<L, R>;
      bind<L, RR>(f: (val: R) => Either<L, RR>): Either<L, RR>;
      extract(transform?: (left: any) => any): R;
    }
  }

  export namespace Either {
    export const Return: typeof Monad.Either.Either.Return;
    export type Left<L> = Monad.Either.Left<L>;
    export function Left<L>(val: L): Left<L>;
    export type Right<R> = Monad.Either.Right<R>;
    export function Right<R>(val: R): Right<R>;
  }

  export type Either<L, R> = Monad.Either<L, R>;
  export type Left<L> = Either.Left<L>;
  export const Left: typeof Either.Left;
  export type Right<R> = Either.Right<R>;
  export const Right: typeof Either.Right;

  interface Curry {
    <z>(f: () => z, ctx?: any): () => z;
    <a, z>(f: (a: a) => z, ctx?: any): Curried1<a, z>;
    <a, b, z>(f: (a: a, b: b) => z, ctx?: any): Curried2<a, b, z>;
    <a, b, c, z>(f: (a: a, b: b, c: c) => z, ctx?: any): Curried3<a, b, c, z>;
    <a, b, c, d, z>(f: (a: a, b: b, c: c, d: d) => z, ctx?: any): Curried4<a, b, c, d, z>;
    <a, b, c, d, e, z>(f: (a: a, b: b, c: c, d: d, e: e) => z, ctx?: any): Curried5<a, b, c, d, e, z>;
  }
  interface Curried1<a, z> {
    (a: a): z;
  }
  interface Curried2<a, b, z> {
    (a: a, b: b): z;
    (a: a): Curried1<b, z>;
  }
  interface Curried3<a, b, c, z> {
    (a: a, b: b, c: c): z;
    (a: a, b: b): Curried1<c, z>;
    (a: a): Curried2<b, c, z>;
  }
  interface Curried4<a, b, c, d, z> {
    (a: a, b: b, c: c, d: d): z;
    (a: a, b: b, c: c): Curried1<d, z>;
    (a: a, b: b): Curried2<c, d, z>;
    (a: a): Curried3<b, c, d, z>;
  }
  interface Curried5<a, b, c, d, e, z> {
    (a: a, b: b, c: c, d: d, e: e): z;
    (a: a, b: b, c: c, d: d): Curried1<e, z>;
    (a: a, b: b, c: c): Curried2<d, e, z>;
    (a: a, b: b): Curried3<c, d, e, z>;
    (a: a): Curried4<b, c, d, e, z>;
  }
  export const curry: Curry;
  export function flip<a, b, c>(f: (a: a) => (b: b) => c): Curried2<b, a, c>
  export function flip<a, b, c>(f: (a: a, b: b) => c): Curried2<b, a, c>

  export class DataMap<K, V> {
    get(key: K): V;
    set(key: K, val: V): this;
    has(key: K): boolean;
    delete(key: K): boolean;
    clear(): void;
    size: number;
  }
  export class AttrMap<O extends Object, K, V> {
    get(obj: O, key: K): V;
    set(obj: O, key: K, val: V): this;
    has(obj: O, key: K): boolean;
    delete(obj: O, key?: K): boolean;
  }
  export class RelationMap<S extends Object, T extends Object, V> {
    get(source: S, target: T): V;
    set(source: S, target: T, val: V): this;
    has(source: S, target: T): boolean;
    delete(source: S, target?: T): boolean;
  }

  export function Mixin<T>(...mixins: Array<new (...args: any[]) => any>): new (...args: any[]) => T;

  export function Tick(fn: (_?: void) => any): void

  export const FINGERPRINT: number;
  export function uuid(): string
  export function sqid(id?: number): string
  export function assign<T extends Object>(target: T | {}, ...sources: T[]): T
  export function clone<T extends Object>(target: T | {}, ...sources: T[]): T
  export function extend<T extends Object>(target: T | {}, ...sources: T[]): T
  export function concat<T>(target: T[], source: T[]): T[]
  export function concat<T>(target: T[], source: { [index: number]: T; length: number; }): T[]
  export function sort<T>(as: T[], cmp: (a: T, b: T) => number, times: number): T[];

}
