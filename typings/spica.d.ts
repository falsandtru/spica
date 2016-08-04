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
    listeners: Set<(reason: L) => void>;
    cancel: (reason: L) => void;
    promise: <T>(val: T) => Promise<T>;
    maybe: <T>(val: T) => Maybe<T>;
    either: <R>(val: R) => Either<L, R>;
  }

  abstract class Lazy<a> {
  }
  abstract class Functor<a> extends Lazy<a> {
    abstract fmap<b>(f: (a: a) => b): Functor<b>;
  }
  namespace Functor {
    export function fmap<a, b>(m: Functor<a>, f: (a: a) => b): Functor<b>;
    export function fmap<a>(m: Functor<a>): <b>(f: (a: a) => b) => Functor<b>;
  }
  export abstract class Applicative<a> extends Functor<a> {
  }
  export namespace Applicative {
    export function pure<a>(a: a): Applicative<a>;
    export function ap<_, b>(ff: Applicative<() => b>): () => Applicative<b>;
    export function ap<a, b>(ff: Applicative<(a: a) => b>, fa: Applicative<a>): Applicative<b>;
    export function ap<a, b>(ff: Applicative<(a: a) => b>): (fa: Applicative<a>) => Applicative<b>;
  }
  abstract class Monad<a> extends Applicative<a> {
    abstract bind<b>(f: (a: a) => Monad<b>): Monad<b>;
  }
  namespace Monad {
    export function Return<a>(a: a): Monad<a>;
    export function bind<a, b>(m: Monad<a>, f: (a: a) => Monad<b>): Monad<b>;
    export function bind<a>(m: Monad<a>): <b>(f: (a: a) => Monad<b>) => Monad<b>;
  }
  abstract class MonadPlus<a> extends Monad<a> {
  }
  namespace MonadPlus {
    export const mzero: MonadPlus<any>;
    export function mplus<a>(ml: MonadPlus<a>, mr: MonadPlus<a>): MonadPlus<a>;
  }

  export class Sequence<a, z> extends MonadPlus<a> {
    static from<a>(as: a[]): Sequence<a, number>;
    static write<a>(as: a[]): Sequence<a, a[]>;
    static cycle<a>(as: a[]): Sequence<a, number>;
    static random(): Sequence<number, number>;
    static random<a>(gen: () => a): Sequence<a, number>;
    static random<a>(as: a[]): Sequence<a, Sequence.Iterator<number>>;
    static zip<a, b>(a: Sequence<a, any>, b: Sequence<b, any>): Sequence<[a, b], [Sequence.Iterator<a>, Sequence.Iterator<b>]>;
    static concat<a>(as: Sequence<Sequence<a, any>, any>): Sequence<a, [Sequence.Iterator<Sequence<a, any>>, Sequence.Iterator<a>]>;
    static difference<a>(a: Sequence<a, any>, b: Sequence<a, any>, cmp: (l: a, r: a) => number): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]>;
    static union<a>(a: Sequence<a, any>, b: Sequence<a, any>, cmp: (l: a, r: a) => number): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]>;
    static intersect<a>(a: Sequence<a, any>, b: Sequence<a, any>, cmp: (l: a, r: a) => number): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]>;
    static fmap<a, b>(m: Sequence<a, any>, f: (a: a) => b): Sequence<b, Sequence.Iterator<a>>;
    static fmap<a>(m: Sequence<a, any>): <b>(f: (a: a) => b) => Sequence<b, Sequence.Iterator<a>>;
    static pure<a>(a: a): Sequence<a, number>;
    static ap<_, b>(ff: Sequence<() => b, any>): () => Sequence<() => b, [Sequence.Iterator<Sequence<b, any>>, Sequence.Iterator<b>]>
    static ap<a, b>(ff: Sequence<(a: a) => b, any>, fa: Sequence<a, any>): Sequence<b, [Sequence.Iterator<Sequence<b, any>>, Sequence.Iterator<b>]>
    static ap<a, b>(ff: Sequence<(a: a) => b, any>): (fa: Sequence<a, any>) => Sequence<b, [Sequence.Iterator<Sequence<b, any>>, Sequence.Iterator<b>]>
    static Return: typeof Sequence.pure;
    static bind<a, b>(m: Sequence<a, any>, f: (a: a) => Sequence<b, any>): Sequence<b, Sequence.Iterator<a>>;
    static bind<a>(m: Sequence<a, any>): <b>(f: (a: a) => Sequence<b, any>) => Sequence<b, Sequence.Iterator<a>>;
    static mempty: Sequence<any, any>;
    static mappend<a>(l: Sequence<a, any>, r: Sequence<a, any>): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]>;
    static mconcat<a>(as: Sequence<a, any>[]): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]>;
    static mzero: Sequence<any, any>;
    static mplus<a>(l: Sequence<a, any>, r: Sequence<a, any>): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]>;
    constructor(cons: (z: z, cons: (a?: a, z?: z) => Sequence.Data<a, z>) => Sequence.Data<a, z>);
    iterate(): Sequence.Thunk<a>;
    read(): a[];
    fmap<b>(f: (a: a) => b): Sequence<b, Sequence.Iterator<a>>;
    bind<b>(f: (a: a) => Sequence<b, any>): Sequence<b, [Sequence.Iterator<Sequence<b, any>>, Sequence.Iterator<b>]>;
    mapM<b>(f: (a: a) => Sequence<b, any>): Sequence<b[], [Sequence.Iterator<Sequence<b[], any>>, Sequence.Iterator<b[]>]>;
    filterM(f: (a: a) => Sequence<boolean, any>): Sequence<a[], [Sequence.Iterator<Sequence<a[], any>>, Sequence.Iterator<a[]>]>;
    map<b>(f: (a: a, i: number) => b): Sequence<b, Sequence.Iterator<a>>;
    filter(f: (a: a, i: number) => boolean): Sequence<a, Sequence.Iterator<a>>;
    scan<b>(f: (b: b, a: a) => b, z: b): Sequence<b, [b, Sequence.Iterator<a>, number]>;
    fold<b>(f: (a: a, b: Sequence<b, any>) => Sequence<b, any>, z: Sequence<b, any>): Sequence<b, [Sequence.Iterator<Sequence<b, any>>, Sequence.Iterator<b>]>;
    group(f: (x: a, y: a) => boolean): Sequence<a[], [Sequence.Iterator<a>, a[]]>;
    subsequences(): Sequence<a[], [Sequence.Iterator<a[]>, Sequence.Iterator<a[]>]>;
    permutations(): Sequence<a[], [Sequence.Iterator<Sequence<a[], any>>, Sequence.Iterator<a[]>]>;
    take(n: number): Sequence<a, Sequence.Iterator<a>>;
    drop(n: number): Sequence<a, Sequence.Iterator<a>>;
    takeWhile(f: (a: a) => boolean): Sequence<a, Sequence.Iterator<a>>;
    dropWhile(f: (a: a) => boolean): Sequence<a, Sequence.Iterator<a>>;
    takeUntil(f: (a: a) => boolean): Sequence<a, Sequence.Iterator<a>>;
    dropUntil(f: (a: a) => boolean): Sequence<a, Sequence.Iterator<a>>;
    memoize(memory?: Map<number, Sequence.Data<a, z>>): Sequence<a, z>;
  }
  export namespace Sequence {
    export type Data<a, z> = [a, z];
    export type Thunk<a> = [a, Iterator<a>, number];
    export type Iterator<a> = () => Thunk<a>;
  }

  namespace Monad {
    export abstract class Maybe<a> extends MonadPlus<a> {
      protected MAYBE: Just<a> | Nothing;
      fmap<b>(f: (a: a) => b): Maybe<b>;
      bind<b>(f: (a: a) => Maybe<b>): Maybe<b>;
      extract(): a;
      extract<b>(transform: () => b): a | b;
      maybe<b>(nothing: () => b, just: (a: a) => b): Just<b>;
    }
  }
  namespace Monad.Maybe {
    export class Maybe<a> extends Monad.Maybe<a> {
    }
    export namespace Maybe {
      export function fmap<a, b>(m: Maybe<a>, f: (a: a) => b): Maybe<b>;
      export function fmap<a>(m: Maybe<a>): <b>(f: (a: a) => b) => Maybe<b>;
      export function pure<a>(a: a): Maybe<a>;
      export function ap<_, b>(ff: Maybe<() => b>): () => Maybe<b>;
      export function ap<a, b>(ff: Maybe<(a: a) => b>, fa: Maybe<a>): Maybe<b>;
      export function ap<a, b>(ff: Maybe<(a: a) => b>): (fa: Maybe<a>) => Maybe<b>;
      export const Return: typeof pure;
      export function bind<a, b>(m: Maybe<a>, f: (a: a) => Maybe<b>): Maybe<b>;
      export function bind<a>(m: Maybe<a>): <b>(f: (a: a) => Maybe<b>) => Maybe<b>;
      export const mzero: Maybe<any>;
      export function mplus<a>(ml: Maybe<a>, mr: Maybe<a>): Maybe<a>;
    }
    export class Just<a> extends Maybe<a> {
      protected MAYBE: Just<a>;
      protected JUST: a;
      bind<b>(f: (a: a) => Maybe<b>): Maybe<b>;
      extract(): a;
      extract<b>(transform: () => b): a;
    }
    export class Nothing extends Maybe<any> {
      protected MAYBE: Nothing;
      protected NOTHING: void;
      bind<b>(f: (a: any) => Maybe<b>): Maybe<b>;
      extract(): any;
      extract<b>(transform: () => b): b;
    }
  }

  export namespace Maybe {
    export const fmap: typeof Monad.Maybe.fmap;
    export const pure: typeof Monad.Maybe.Maybe.pure;
    export const ap: typeof Monad.Maybe.Maybe.ap;
    export const Return: typeof Monad.Maybe.Maybe.Return;
    export const bind: typeof Monad.Maybe.Maybe.bind;
    export const mzero: typeof Monad.Maybe.Maybe.mzero;
    export const mplus: typeof Monad.Maybe.Maybe.mplus;
  }

  export type Maybe<a> = Monad.Maybe<a>;
  export type Just<a> = Monad.Maybe.Just<a>;
  export function Just<a>(a: a): Just<a>;
  export type Nothing = Monad.Maybe.Nothing;
  export const Nothing: Nothing;

  namespace Monad {
    export abstract class Either<a, b> extends Monad<b> {
      protected EITHER: Left<a> | Right<b>;
      fmap<c>(f: (b: b) => c): Either<a, c>;
      bind<c>(f: (b: b) => Either<a, c>): Either<a, c>;
      extract(): b;
      extract<c>(transform: (a: a) => c): c | b;
      either<c>(left: (a: a) => c, right: (b: b) => c): Right<c>;
    }
  }
  namespace Monad.Either {
    export class Either<a, b> extends Monad.Either<a, b> {
    }
    export namespace Either {
      export function fmap<e, a, b>(m: Either<e, a>, f: (a: a) => b): Either<e, b>;
      export function fmap<e, a>(m: Either<e, a>): <b>(f: (a: a) => b) => Either<e, b>;
      export function pure<b>(b: b): Right<b>;
      export function ap<e, _, b>(ff: Either<e, () => b>): () => Either<e, b>;
      export function ap<e, a, b>(ff: Either<e, (a: a) => b>, fa: Either<e, a>): Either<e, b>;
      export function ap<e, a, b>(ff: Either<e, (a: a) => b>): (fa: Either<e, a>) => Either<e, b>;
      export const Return: typeof pure;
      export function bind<e, a, b>(m: Either<e, a>, f: (a: a) => Either<e, b>): Either<e, b>;
      export function bind<e, a>(m: Either<e, a>): <b>(f: (a: a) => Either<e, b>) => Either<e, b>;
    }
    export class Left<a> extends Either<a, any> {
      protected EITHER: Left<a>;
      protected LEFT: a;
      bind<_ extends a>(f: (b: any) => Either<a, any>): Either<a, any>;
      bind<_ extends a, b>(f: (b: b) => Either<a, b>): Either<a, b>;
      extract(): any;
      extract<c>(transform: (a: a) => c): c;
    }
    export class Right<b> extends Either<any, b> {
      protected EITHER: Right<b>;
      protected RIGHT: b;
      bind<a>(f: (b: b) => Either<a, b>): Either<a, b>;
      bind<a, c>(f: (b: b) => Either<a, c>): Either<a, c>;
      extract(): b;
      extract<c>(transform: (a: c) => c): b;
    }
  }

  export namespace Either {
    export const fmap: typeof Monad.Either.fmap;
    export const pure: typeof Monad.Either.Either.pure;
    export const ap: typeof Monad.Either.Either.ap;
    export const Return: typeof Monad.Either.Either.Return;
    export const bind: typeof Monad.Either.Either.bind;
  }

  export type Either<a, b> = Monad.Either<a, b>;
  export type Left<a> = Monad.Either.Left<a>;
  export function Left<a>(a: a): Left<a>;
  export type Right<b> = Monad.Either.Right<b>;
  export function Right<b>(b: b): Right<b>;

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

  export interface List<a, c extends Nil | List<a, any>> extends Cons<a, c> { }
  export class Nil {
    private NIL: void;
    push<a>(a: a): Cons<a, Nil>;
  }
  class Cons<a, c extends Nil | Cons<a, any>> {
    private CONS: a;
    push(a: a): Cons<a, this>;
    head(): a;
    tail(): c;
    walk(f: (a: a) => void): c;
    modify(f: (a: a) => a): Cons<a, c>;
    extend(f: (a: a) => a): Cons<a, this>;
    array(): a[];
  }

  export interface HList<a, c extends HNil | HList<any, any>> extends HCons<a, c> { }
  export class HNil {
    private NIL: void;
    push<b>(b: b): HCons<b, HNil>;
  }
  class HCons<a, c extends HNil | HCons<any, any>> {
    private CONS: a;
    push<b>(b: b): HCons<b, this>;
    head(): a;
    tail(): c;
    walk(f: (a: a) => void): c;
    modify<b>(f: (a: a) => b): HCons<b, c>;
    extend<b>(f: (a: a) => b): HCons<b, this>;
  }

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
  export function sqid(): string
  export function sqid(id: number): string
  export function assign<T extends Object>(target: T | {}, ...sources: T[]): T
  export function clone<T extends Object>(target: T | {}, ...sources: T[]): T
  export function extend<T extends Object>(target: T | {}, ...sources: T[]): T
  export function concat<T>(target: T[], source: T[]): T[]
  export function concat<T>(target: T[], source: { [index: number]: T; length: number; }): T[]
  export function sort<T>(as: T[], cmp: (a: T, b: T) => number, times: number): T[];

}
