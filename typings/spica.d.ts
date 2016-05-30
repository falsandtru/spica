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

  abstract class Lazy<T> {
    private LAZY: T;
  }
  abstract class Functor<T> extends Lazy<T> {
    private FUNCTOR: T;
    abstract fmap<U>(f: (val: T) => U): Functor<U>;
  }
  abstract class Monad<T> extends Functor<T> {
    private MONAD: T;
    abstract bind<U>(f: (val: T) => Monad<U>): Monad<U>;
  }

  namespace MAYBE {
    export abstract class Maybe<T> extends Monad<T> {
      protected MAYBE: Just<T> | Nothing;
      bind(f: (val: T) => Nothing): Nothing;
      bind<U>(f: (val: T) => Maybe<U>): Maybe<U>;
      fmap<U>(f: (val: T) => U): Maybe<U>;
      extract(): T;
      extract<U>(transform: () => U): T | U;
      assert<S extends Maybe<T>>(type?: S): Maybe<T>;
    }
    export class Just<T> extends Maybe<T> {
      protected MAYBE: Just<T>;
      bind(f: (val: T) => Nothing): Nothing;
      bind<U>(f: (val: T) => Maybe<U>): Maybe<U>;
      extract<U>(transform?: () => U): T;
      assert<S extends Just<T>>(type?: S): Just<T>;
    }
    export class Nothing extends Maybe<any> {
      protected MAYBE: Nothing;
      bind(f: (val: any) => Maybe<any>): Nothing;
      fmap(f: (val: any) => any): Nothing;
      extract(): any;
      extract<U>(transform: () => U): U;
      assert<S extends Nothing>(type?: S): Nothing;
    }
  }

  export namespace Maybe {
    export type Just<T> = MAYBE.Just<T>;
    export function Just<T>(val: T): Just<T>;
    export type Nothing = MAYBE.Nothing;
    export const Nothing: MAYBE.Nothing;
    export const Return: typeof Just;
  }

  export type Maybe<T> = MAYBE.Maybe<T>;
  export type Just<T> = Maybe.Just<T>;
  export const Just: typeof Maybe.Just;
  export type Nothing = Maybe.Nothing;
  export const Nothing: typeof Maybe.Nothing;

  namespace EITHER {
    export abstract class Either<L, R> extends Monad<R> {
      protected EITHER: Left<L> | Right<R>;
      bind(f: (val: R) => Left<L>): Left<L>
      bind<RR>(f: (val: R) => Either<L, RR>): Either<L, RR>;
      fmap<RR>(f: (val: R) => RR): Either<L, RR>;
      extract(): R;
      extract<LL>(transform: (left: L) => LL): LL | R;
      assert<S extends Either<L, R>>(type?: S): Either<L, R>;
    }
    export class Left<L> extends Either<L, any> {
      protected EITHER: Left<L>;
      bind(f: (val: any) => Either<L, any>): Left<L>;
      fmap(f: (val: any) => any): Left<L>;
      extract(): any;
      extract<LL>(transform: (left: L) => LL): LL;
      assert<S extends Left<L>>(type?: S): Left<L>;
    }
    export class Right<R> extends Either<any, R> {
      protected EITHER: Right<R>;
      bind<L>(f: (val: R) => Left<L>): Left<L>;
      bind<L>(f: (val: R) => Either<L, R>): Either<L, R>;
      bind<L, RR>(f: (val: R) => Either<L, RR>): Either<L, RR>;
      extract(transform?: (left: any) => any): R;
      assert<S extends Right<R>>(type?: S): Right<R>;
    }
  }

  export namespace Either {
    export type Left<L> = EITHER.Left<L>;
    export function Left<L>(val: L): Left<L>;
    export type Right<R> = EITHER.Right<R>;
    export function Right<R>(val: R): Right<R>;
    export const Return: typeof Right;
  }

  export type Either<L, R> = EITHER.Either<L, R>;
  export type Left<L> = Either.Left<L>;
  export const Left: typeof Either.Left;
  export type Right<R> = Either.Right<R>;
  export const Right: typeof Either.Right;

  export class Map<K, V> {
    get(key: K): V;
    set(key: K, val: V): V;
    has(key: K): boolean;
    delete(key: K): void;
    clear(): void;
    size: number;
    entries(): [K, V][];
  }
  export class DataMap<K, V> {
    get(key: K): V;
    set(key: K, val: V): V;
    has(key: K): boolean;
    delete(key: K): void;
    clear(): void;
    size: number;
    entries(): [K, V][];
  }
  export class WeakMap<K extends Object, V> {
    get(key: K): V;
    set(key: K, val: V): V;
    has(key: K): boolean;
    delete(key: K): void;
  }
  export class AttrMap<O extends Object, K extends string | number, V> {
    get(obj: O, key: K): V;
    set(obj: O, key: K, val: V): V;
    has(obj: O, key: K): boolean;
    delete(obj: O, key?: K): void;
  }
  export class RelationMap<S extends Object, T extends Object, V> {
    get(source: S, target: T): V;
    set(source: S, target: T, val: V): V;
    has(source: S, target: T): boolean;
    delete(source: S, target?: T): void;
  }
  export class Set<K, V> {
    constructor(replacer?: (oldVal: V, newVal: V) => V)
    get(key: K): V;
    add(key: K, val: V): V;
    has(key: K): boolean;
    delete(key: K): void;
    clear(): void;
    size: number;
    entries(): [K, V][];
  }
  export class DataSet<K, V> {
    constructor(replacer?: (oldVal: V, newVal: V) => V)
    get(key: K): V;
    add(key: K, val: V): V;
    has(key: K): boolean;
    delete(key: K): void;
    clear(): void;
    size: number;
    entries(): [K, V][];
  }
  export class WeakSet<K extends Object, V> {
    constructor(replacer?: (oldVal: V, newVal: V) => V)
    get(key: K): V;
    add(key: K, val: V): V;
    has(key: K): boolean;
    delete(key: K): void;
  }
  export class AttrSet<O extends Object, K extends string | number, V> {
    constructor(replacer?: (oldVal: V, newVal: V) => V)
    get(obj: O, key: K): V;
    add(obj: O, key: K, val: V): V;
    has(obj: O, key: K): boolean;
    delete(obj: O, key?: K): void;
  }
  export class RelationSet<S extends Object, T extends Object, V> {
    constructor(replacer?: (oldVal: V, newVal: V) => V)
    get(source: S, target: T): V;
    add(source: S, target: T, val: V): V;
    has(source: S, target: T): boolean;
    delete(source: S, target?: T): void;
  }

  export function Tick(fn: (_?: void) => any): void

  export const FINGERPRINT: number;
  export function uuid(): string
  export function sqid(id?: number): string
  export function assign<T extends Object>(target: T | {}, ...sources: T[]): T
  export function clone<T extends Object>(target: T | {}, ...sources: T[]): T
  export function extend<T extends Object>(target: T | {}, ...sources: T[]): T
  export function concat<T>(target: T[], source: T[]): T[]
  export function concat<T>(target: T[], source: { [index: number]: T; length: number; }): T[]

}
