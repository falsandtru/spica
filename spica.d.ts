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
        export type Fail<T extends string[], D> = [T, D];
        export type Loss<T extends string[], D> = [T, D];
        export type Exit<T extends string[], D, R> = [T, (data: D) => R, any];
      }
    }
  }
  export abstract class Supervisor<T extends string[], D, R> {
    static readonly count: number;
    static readonly procs: number;
    constructor(settings?: SupervisorSettings<T>)
    readonly name: string;
    readonly events: {
      readonly exec: Observer<T, Supervisor.Event.Data.Exec<T, D, R>, any>;
      readonly fail: Observer<T, Supervisor.Event.Data.Fail<T, D>, any>;
      readonly loss: Observer<T, Supervisor.Event.Data.Loss<T, D>, any>;
      readonly exit: Observer<T, Supervisor.Event.Data.Exit<T, D, R>, any>;
    };
    register(namespace: T, process: (data: D) => R): (reason?: any) => void;
    call(namespace: T, data: D, timeout?: number): Promise<R[]>;
    cast(namespace: T, data: D, retry?: boolean): R[];
    refs(namespace: T): [T, (data: D) => R, (reason: any) => void][];
    terminate(namespace?: T, reason?: any): void;
  }
  export interface SupervisorSettings<T> {
    readonly name?: string;
    readonly dependencies?: [T, T[]][];
    readonly retry?: boolean;
    readonly timeout?: number;
    readonly destructor?: (reason?: any) => any;
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
    readonly listeners: Set<(reason: L) => void>;
    readonly cancel: (reason: L) => void;
    readonly promise: <T>(val: T) => Promise<T>;
    readonly maybe: <T>(val: T) => Maybe<T>;
    readonly either: <R>(val: R) => Either<L, R>;
  }

  abstract class Lazy<a> {
    abstract extract(): any;
  }
  abstract class Functor<a> extends Lazy<a> {
    abstract fmap<b>(f: (a: a) => b): Functor<b>;
  }
  namespace Functor {
    export function fmap<a, b>(m: Functor<a>, f: (a: a) => b): Functor<b>;
    export function fmap<a>(m: Functor<a>): <b>(f: (a: a) => b) => Functor<b>;
  }
  export abstract class Applicative<a> extends Functor<a> {
    abstract ap<b>(this: Applicative<(a: a) => b>, a: Applicative<a>): Applicative<b>;
  }
  export namespace Applicative {
    export function pure<a>(a: a): Applicative<a>;
    export function ap<a, b>(af: Applicative<(a: a) => b>, aa: Applicative<a>): Applicative<b>;
    export function ap<a, b>(af: Applicative<(a: a) => b>): (aa: Applicative<a>) => Applicative<b>;
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

  export class Sequence<a, z> extends MonadPlus<a> implements Iterable<a> {
    static from<a>(as: Iterable<a>): Sequence<a, [Iterator<a>, number, Map<number, IteratorResult<a>>]>;
    static cycle<a>(as: Iterable<a>): Sequence<a, [Iterator<a>, number, Map<number, IteratorResult<a>>]>;
    static random(): Sequence<number, [Iterator<number>, number, Map<number, IteratorResult<number>>]>;
    static random<a>(gen: () => a): Sequence<a, [Iterator<a>, number, Map<number, IteratorResult<a>>]>;
    static random<a>(as: a[]): Sequence<a, Sequence.Iterator<number>>;
    static zip<a, b>(a: Sequence<a, any>, b: Sequence<b, any>): Sequence<[a, b], [Sequence.Iterator<a>, Sequence.Iterator<b>]>;
    static concat<a>(as: Sequence<Sequence<a, any>, any>): Sequence<a, [Sequence.Iterator<Sequence<a, any>>, Sequence.Iterator<a>]>;
    static difference<a>(a: Sequence<a, any>, b: Sequence<a, any>, cmp: (l: a, r: a) => number): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]>;
    static union<a>(a: Sequence<a, any>, b: Sequence<a, any>, cmp: (l: a, r: a) => number): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]>;
    static intersect<a>(a: Sequence<a, any>, b: Sequence<a, any>, cmp: (l: a, r: a) => number): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]>;
    static fmap<a, b>(m: Sequence<a, any>, f: (a: a) => b): Sequence<b, Sequence.Iterator<a>>;
    static fmap<a>(m: Sequence<a, any>): <b>(f: (a: a) => b) => Sequence<b, Sequence.Iterator<a>>;
    static pure<a>(a: a): Sequence<a, number>;
    static ap<a, b>(mf: Sequence<(a: a) => b, any>, ma: Sequence<a, any>): Sequence<b, [Sequence.Iterator<Sequence<b, any>>, Sequence.Iterator<b>]>
    static ap<a, b>(mf: Sequence<(a: a) => b, any>): (ma: Sequence<a, any>) => Sequence<b, [Sequence.Iterator<Sequence<b, any>>, Sequence.Iterator<b>]>
    static Return: typeof Sequence.pure;
    static bind<a, b>(m: Sequence<a, any>, f: (a: a) => Sequence<b, any>): Sequence<b, Sequence.Iterator<a>>;
    static bind<a>(m: Sequence<a, any>): <b>(f: (a: a) => Sequence<b, any>) => Sequence<b, Sequence.Iterator<a>>;
    static readonly mempty: Sequence<any, any>;
    static mappend<a>(l: Sequence<a, any>, r: Sequence<a, any>): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]>;
    static mconcat<a>(as: Iterable<Sequence<a, any>>): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]>;
    static readonly mzero: Sequence<any, any>;
    static mplus<a>(l: Sequence<a, any>, r: Sequence<a, any>): Sequence<a, [Sequence.Iterator<a>, Sequence.Iterator<a>]>;
    constructor(cons: (z: z, cons: (a?: a, z?: z) => Sequence.Data<a, z>) => Sequence.Data<a, z>);
    extract(): a[];
    [Symbol.iterator](): Iterator<a>;
    iterate(): Sequence.Thunk<a>;
    fmap<b>(f: (a: a) => b): Sequence<b, Sequence.Iterator<a>>;
    ap<a, z>(this: Sequence<(a: a) => z, any>, a: Sequence<a, any>): Sequence<z, [Sequence.Iterator<Sequence<z, any>>, Sequence.Iterator<z>]>;
    ap<a, b, z>(this: Sequence<(a: a, b: b) => z, any>, a: Sequence<a, any>): Sequence<(b: b) => z, [Sequence.Iterator<Sequence<z, any>>, Sequence.Iterator<z>]>;
    ap<a, b, c, z>(this: Sequence<(a: a, b: b, c: c) => z, any>, a: Sequence<a, any>): Sequence<(b: b, c: c) => z, [Sequence.Iterator<Sequence<z, any>>, Sequence.Iterator<z>]>;
    ap<a, b, c, d, z>(this: Sequence<(a: a, b: b, c: c, d: d) => z, any>, a: Sequence<a, any>): Sequence<(b: b, c: c, d: d) => z, [Sequence.Iterator<Sequence<z, any>>, Sequence.Iterator<z>]>;
    ap<a, b, c, d, e, z>(this: Sequence<(a: a, b: b, c: c, d: d, e: e) => z, any>, a: Sequence<a, any>): Sequence<(b: b, c: c, d: d, e: e) => z, [Sequence.Iterator<Sequence<z, any>>, Sequence.Iterator<z>]>;
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
      private readonly MAYBE: Just<a> | Nothing;
      fmap<b>(f: (a: a) => b): Maybe<b>;
      ap<a, z>(this: Maybe<(a: a) => z>, a: Maybe<a>): Maybe<z>;
      ap<a, b, z>(this: Maybe<(a: a, b: b) => z>, a: Maybe<a>): Maybe<(b: b) => z>;
      ap<a, b, c, z>(this: Maybe<(a: a, b: b, c: c) => z>, a: Maybe<a>): Maybe<(b: b, c: c) => z>;
      ap<a, b, c, d, z>(this: Maybe<(a: a, b: b, c: c, d: d) => z>, a: Maybe<a>): Maybe<(b: b, c: c, d: d) => z>;
      ap<a, b, c, d, e, z>(this: Maybe<(a: a, b: b, c: c, d: d, e: e) => z>, a: Maybe<a>): Maybe<(b: b, c: c, d: d, e: e) => z>;
      bind(f: (a: a) => Nothing): Maybe<a>;
      bind<b>(f: (a: a) => Maybe<b> | Nothing): Maybe<b>;
      extract(): a;
      extract<b>(transform: () => b): a | b;
      extract<b>(nothing: () => b, just: (a: a) => b): b;
    }
  }
  namespace Monad.Maybe {
    export class Maybe<a> extends Monad.Maybe<a> {
    }
    export namespace Maybe {
      export function fmap<a, b>(m: Maybe<a>, f: (a: a) => b): Maybe<b>;
      export function fmap<a>(m: Maybe<a>): <b>(f: (a: a) => b) => Maybe<b>;
      export function pure<a>(a: a): Maybe<a>;
      export function ap<a, b>(mf: Maybe<(a: a) => b>, ma: Maybe<a>): Maybe<b>;
      export function ap<a, b>(mf: Maybe<(a: a) => b>): (ma: Maybe<a>) => Maybe<b>;
      export const Return: typeof pure;
      export function bind<a>(m: Maybe<a>, f: (a: a) => Nothing): Maybe<a>;
      export function bind<a, b>(m: Maybe<a>, f: (a: a) => Maybe<b> | Nothing): Maybe<b>;
      export function bind<a>(m: Maybe<a>): {
        (f: (a: a) => Nothing): Maybe<a>;
        <b>(f: (a: a) => Maybe<b> | Nothing): Maybe<b>;
      }
      export const mzero: Nothing;
      export function mplus<a>(ml: Maybe<a>, mr: Nothing): Maybe<a>;
      export function mplus<a>(ml: Nothing, mr: Maybe<a>): Maybe<a>;
      export function mplus<a>(ml: Maybe<a>, mr: Maybe<a>): Maybe<a>;
    }
    export class Just<a> extends Maybe<a> {
      private readonly JUST: a;
      bind(f: (a: a) => Nothing): Maybe<a>;
      bind<b>(f: (a: a) => Maybe<b> | Nothing): Maybe<b>;
      extract(): a;
      extract<b>(transform: () => b): a;
      extract<b>(nothing: () => b, just: (a: a) => b): b;
    }
    export class Nothing extends Maybe<any> {
      private readonly NOTHING: void;
      bind(f: (a: any) => Nothing): Nothing;
      bind<b>(f: (a: any) => Maybe<b> | Nothing): Maybe<b>;
      extract(): any;
      extract<b>(transform: () => b): b;
      extract<b>(nothing: () => b, just: (a: void) => b): b;
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
      private readonly EITHER: Left<a> | Right<b>;
      fmap<c>(f: (b: b) => c): Either<a, c>;
      ap<b, z>(this: Either<a, (b: b) => z>, b: Either<a, b>): Either<a, z>;
      ap<b, c, z>(this: Either<a, (b: b, c: c) => z>, b: Either<a, b>): Either<a, (c: c) => z>;
      ap<b, c, d, z>(this: Either<a, (b: b, c: c, d: d) => z>, b: Either<a, b>): Either<a, (c: c, d: d) => z>;
      ap<b, c, d, e, z>(this: Either<a, (b: b, c: c, d: d, e: e) => z>, b: Either<a, b>): Either<a, (c: c, d: d, e: e) => z>;
      ap<b, c, d, e, f, z>(this: Either<a, (b: b, c: c, d: d, e: e, f: f) => z>, b: Either<a, b>): Either<a, (c: c, d: d, e: e, f: f) => z>;
      bind(f: (b: b) => Left<a>): Either<a, b>;
      bind<c>(f: (b: b) => Either<a, c>): Either<a, c>;
      extract(): b;
      extract<c>(transform: (a: a) => c): b | c;
      extract<c>(left: (a: a) => c, right: (b: b) => c): c;
    }
  }
  namespace Monad.Either {
    export class Either<a, b> extends Monad.Either<a, b> {
    }
    export namespace Either {
      export function fmap<e, a, b>(m: Either<e, a>, f: (a: a) => b): Either<e, b>;
      export function fmap<e, a>(m: Either<e, a>): <b>(f: (a: a) => b) => Either<e, b>;
      export function pure<b>(b: b): Right<b>;
      export function ap<e, a, b>(mf: Either<e, (a: a) => b>, ma: Either<e, a>): Either<e, b>;
      export function ap<e, a, b>(mf: Either<e, (a: a) => b>): (ma: Either<e, a>) => Either<e, b>;
      export const Return: typeof pure;
      export function bind<e, a, b>(m: Either<e, a>, f: (a: a) => Either<e, b>): Either<e, b>;
      export function bind<e, a>(m: Either<e, a>): <b>(f: (a: a) => Either<e, b>) => Either<e, b>;
    }
    export class Left<a> extends Either<a, any> {
      private readonly LEFT: a;
      bind(_: (b: any) => Left<a>): Left<a>;
      bind<b>(f: (b: b) => Either<a, b>): Either<a, b>;
      extract(): any;
      extract<c>(transform: (a: a) => c): c;
      extract<c>(left: (a: a) => c, right: (b: void) => c): c;
    }
    export class Right<b> extends Either<any, b> {
      private readonly RIGHT: b;
      bind<c>(f: (b: b) => Right<c>): Right<c>;
      bind<a, c>(f: (b: b) => Either<a, c>): Either<a, c>;
      extract(): b;
      extract<c>(transform: (a: void) => c): b;
      extract<c>(left: (a: void) => c, right: (b: b) => c): c;
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
  export function Left<a, b>(a: a): Either<a, b>;
  export type Right<b> = Monad.Either.Right<b>;
  export function Right<b>(b: b): Right<b>;
  export function Right<a, b>(b: b): Either<a, b>;

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
  interface Curry {
    <z>(f: () => z, ctx?: any): () => z;
    <a, z>(f: (a: a) => z, ctx?: any): Curried1<a, z>;
    <a, b, z>(f: (a: a, b: b) => z, ctx?: any): Curried2<a, b, z>;
    <a, b, c, z>(f: (a: a, b: b, c: c) => z, ctx?: any): Curried3<a, b, c, z>;
    <a, b, c, d, z>(f: (a: a, b: b, c: c, d: d) => z, ctx?: any): Curried4<a, b, c, d, z>;
    <a, b, c, d, e, z>(f: (a: a, b: b, c: c, d: d, e: e) => z, ctx?: any): Curried5<a, b, c, d, e, z>;
  }
  export const curry: Curry;
  export function flip<a, b, c>(f: (a: a) => (b: b) => c): Curried2<b, a, c>
  export function flip<a, b, c>(f: (a: a, b: b) => c): Curried2<b, a, c>

  export interface List<a, c extends Nil | List<a, any>> extends Cons<a, c> { }
  export class Nil {
    private readonly NIL: void;
    push<a>(a: a): List<a, Nil>;
  }
  class Cons<a, c extends Nil | List<a, any>> {
    private readonly CONS: a;
    push(a: a): List<a, this>;
    head(): a;
    tail(): c;
    walk(f: (a: a) => void): c;
    modify(f: (a: a) => a): List<a, c>;
    extend(f: (a: a) => a): List<a, this>;
    compact<c extends Nil | List<a, any>>(this: List<a, List<a, c>>, f: (l: a, r: a) => a): List<a, c>;
    reverse(): List<a, c>;
    tuple(this: List<a, Nil>): [a];
    tuple(this: List<a, List<a, Nil>>): [a, a];
    tuple(this: List<a, List<a, List<a, Nil>>>): [a, a, a];
    tuple(this: List<a, List<a, List<a, List<a, Nil>>>>): [a, a, a, a];
    tuple(this: List<a, List<a, List<a, List<a, List<a, Nil>>>>>): [a, a, a, a, a];
    tuple(this: List<a, List<a, List<a, List<a, List<a, List<a, Nil>>>>>>): [a, a, a, a, a, a];
    tuple(this: List<a, List<a, List<a, List<a, List<a, List<a, List<a, Nil>>>>>>>): [a, a, a, a, a, a, a];
    tuple(this: List<a, List<a, List<a, List<a, List<a, List<a, List<a, List<a, Nil>>>>>>>>): [a, a, a, a, a, a, a, a];
    tuple(this: List<a, List<a, List<a, List<a, List<a, List<a, List<a, List<a, List<a, Nil>>>>>>>>>): [a, a, a, a, a, a, a, a, a];
    array(): a[];
  }

  export interface HList<a, c extends HNil | HList<any, any>> extends HCons<a, c> { }
  export class HNil {
    private readonly NIL: void;
    push<b>(b: b): HList<b, HNil>;
  }
  class HCons<a, c extends HNil | HList<any, any>> {
    private readonly CONS: a;
    push<b>(b: b): HList<b, this>;
    head(): a;
    tail(): c;
    walk(f: (a: a) => void): c;
    modify<b>(f: (a: a) => b): HList<b, c>;
    extend<b>(f: (a: a) => b): HList<b, this>;
    compact<b, c, d extends HNil | HList<any, any>>(this: HList<a, HList<b, d>>, f: (a: a, b: b) => c): HList<c, d>;
    reverse<a>(this: HList<a, HNil>): HList<a, HNil>;
    reverse<a, b>(this: HList<a, HList<b, HNil>>): HList<b, HList<a, HNil>>;
    reverse<a, b, c>(this: HList<a, HList<b, HList<c, HNil>>>): HList<c, HList<b, HList<a, HNil>>>;
    reverse<a, b, c, d>(this: HList<a, HList<b, HList<c, HList<d, HNil>>>>): HList<d, HList<c, HList<b, HList<a, HNil>>>>;
    reverse<a, b, c, d, e>(this: HList<a, HList<b, HList<c, HList<d, HList<e, HNil>>>>>): HList<e, HList<d, HList<c, HList<b, HList<a, HNil>>>>>;
    reverse<a, b, c, d, e, f>(this: HList<a, HList<b, HList<c, HList<d, HList<e, HList<f, HNil>>>>>>): HList<f, HList<e, HList<d, HList<c, HList<b, HList<a, HNil>>>>>>;
    reverse<a, b, c, d, e, f, g>(this: HList<a, HList<b, HList<c, HList<d, HList<e, HList<f, HList<g, HNil>>>>>>>): HList<g, HList<f, HList<e, HList<d, HList<c, HList<b, HList<a, HNil>>>>>>>;
    reverse<a, b, c, d, e, f, g, h>(this: HList<a, HList<b, HList<c, HList<d, HList<e, HList<f, HList<g, HList<h, HNil>>>>>>>>): HList<h, HList<g, HList<f, HList<e, HList<d, HList<c, HList<b, HList<a, HNil>>>>>>>>;
    reverse<a, b, c, d, e, f, g, h, i>(this: HList<a, HList<b, HList<c, HList<d, HList<e, HList<f, HList<g, HList<h, HList<i, HNil>>>>>>>>>): HList<i, HList<h, HList<g, HList<f, HList<e, HList<d, HList<c, HList<b, HList<a, HNil>>>>>>>>>;
    tuple<a>(this: HList<a, HNil>): [a];
    tuple<a, b>(this: HList<a, HList<b, HNil>>): [a, b];
    tuple<a, b, c>(this: HList<a, HList<b, HList<c, HNil>>>): [a, b, c];
    tuple<a, b, c, d>(this: HList<a, HList<b, HList<c, HList<d, HNil>>>>): [a, b, c, d];
    tuple<a, b, c, d, e>(this: HList<a, HList<b, HList<c, HList<d, HList<e, HNil>>>>>): [a, b, c, d, e];
    tuple<a, b, c, d, e, f>(this: HList<a, HList<b, HList<c, HList<d, HList<e, HList<f, HNil>>>>>>): [a, b, c, d, e, f];
    tuple<a, b, c, d, e, f, g>(this: HList<a, HList<b, HList<c, HList<d, HList<e, HList<f, HList<g, HNil>>>>>>>): [a, b, c, d, e, f, g];
    tuple<a, b, c, d, e, f, g, h>(this: HList<a, HList<b, HList<c, HList<d, HList<e, HList<f, HList<g, HList<h, HNil>>>>>>>>): [a, b, c, d, e, f, g, h];
    tuple<a, b, c, d, e, f, g, h, i>(this: HList<a, HList<b, HList<c, HList<d, HList<e, HList<f, HList<g, HList<h, HList<i, HNil>>>>>>>>>): [a, b, c, d, e, f, g, h, i];
  }

  export class DataMap<K, V> {
    get(key: K): V | undefined;
    set(key: K, val: V): this;
    has(key: K): boolean;
    delete(key: K): boolean;
    clear(): void;
    size: number;
  }
  export class AttrMap<O extends Object, K, V> {
    get(obj: O, key: K): V | undefined;
    set(obj: O, key: K, val: V): this;
    has(obj: O, key: K): boolean;
    delete(obj: O, key?: K): boolean;
  }
  export class RelationMap<S extends Object, T extends Object, V> {
    get(source: S, target: T): V | undefined;
    set(source: S, target: T, val: V): this;
    has(source: S, target: T): boolean;
    delete(source: S, target?: T): boolean;
  }

  export function Mixin<T>(...mixins: Array<new () => Object>): new () => T

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
