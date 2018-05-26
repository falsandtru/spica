/**
*
* spica
*
* @author falsandtru https://github.com/falsandtru/spica
*/

export abstract class Supervisor<N extends string, P = void, R = void, S = void> {
  static readonly count: number;
  static readonly procs: number;
  static readonly terminator: unique symbol;
  constructor(opts?: SupervisorOptions);
  readonly id: string;
  readonly name: string;
  readonly events: {
    readonly init: Observer<never[] | [N], Supervisor.Event.Data.Init<N, P, R, S>, any>;
    readonly loss: Observer<never[] | [N], Supervisor.Event.Data.Loss<N, P>, any>;
    readonly exit: Observer<never[] | [N], Supervisor.Event.Data.Exit<N, P, R, S>, any>;
  };
  readonly available: boolean;
  register(name: N, process: Supervisor.Process<P, R, S> | Supervisor.Process.Main<P, R, S> | Coroutine<R, R, P>, state: S, reason?: any): (reason?: any) => boolean;
  register(name: N, process: Coroutine<R, R, P>, state?: never, reason?: any): (reason?: any) => boolean;
  call(name: N | ('' extends N ? undefined : never), param: P, timeout?: number): Promise<R>;
  call(name: N | ('' extends N ? undefined : never), param: P, callback: Supervisor.Callback<R>, timeout?: number): void;
  cast(name: N | ('' extends N ? undefined : never), param: P, timeout?: number): boolean;
  refs(name?: N): [N, Supervisor.Process<P, R, S>, S, (reason: any) => boolean][];
  kill(name: N, reason?: any): boolean;
  terminate(reason?: any): boolean;
}
export namespace Supervisor {
  export type Process<P, R, S> = {
    readonly init: Process.Init<S>;
    readonly main: Process.Main<P, R, S>;
    readonly exit: Process.Exit<S>;
  };
  export namespace Process {
    export type Init<S> = (state: S) => S;
    export type Main<P, R, S> = (param: P, state: S, kill: (reason?: any) => void) => Result<R, S> | PromiseLike<Result<R, S>>;
    export type Exit<S> = (reason: any, state: S) => void;
    export type Result<R, S> = [R, S] | { reply: R; state: S; };
  }
  export type Callback<R> = (reply: R, error?: Error) => void;
  export namespace Event {
    export namespace Data {
      export type Init<N extends string, P, R, S> = [N, Process<P, R, S>, S];
      export type Loss<N extends string, P> = [N, P];
      export type Exit<N extends string, P, R, S> = [N, Process<P, R, S>, S, any];
    }
  }
}
export interface SupervisorOptions {
  readonly name?: string;
  readonly size?: number;
  readonly timeout?: number;
  readonly destructor?: (reason: any) => void;
  readonly scheduler?: (cb: () => void) => void;
  readonly resource?: number;
}

export class Observation<N extends any[], D, R> {
  constructor(opts?: ObservationOptions);
}
export interface ObservationOptions {
  readonly limit?: number;
}
export interface Observation<N extends any[], D, R>
  extends Observer< N, D, R >, Publisher < N, D, R > {
  relay(source: Observer<N, D, any>): () => void;
  refs(namespace: never[] | N): RegisterItem<N, D, R>[];
}
export interface Observer<N extends any[], D, R> {
  monitor(namespace: N, listener: Monitor<N, D>, opts?: ObserverOptions): () => void;
  on(namespace: N, listener: Subscriber<N, D, R>, opts?: ObserverOptions): () => void;
  off(namespace: N, listener?: Subscriber<N, D, R>): void;
  once(namespace: N, listener: Subscriber<N, D, R>): () => void;
}
export interface ObserverOptions {
  once?: boolean;
}
export interface Publisher<N extends any[], D, R> {
  emit(this: Publisher<N, void, R>, namespace: N, data?: D, tracker?: (data: D, results: R[]) => void): void;
  emit(namespace: N, data: D, tracker?: (data: D, results: R[]) => void): void;
  reflect(this: Publisher<N, void, R>, namespace: N, data?: D): R[];
  reflect(namespace: N, data: D): R[];
}
type Monitor<N extends any[], D> = (data: D, namespace: N) => any;
type Subscriber<N extends any[], D, R> = (data: D, namespace: N) => R;
type RegisterItem<N extends any[], D, R> = {
  type: 'monitor';
  namespace: N;
  listener: Monitor<N, D>;
  opts: ObserverOptions;
 } | {
  type: 'subscriber';
  namespace: N;
  listener: Subscriber<N, D, R>;
  opts: ObserverOptions;
};

export class Cancellation<L = undefined> extends Promise<L> {
  constructor(cancelees?: Iterable<Cancellee<L>>);
}
export interface Cancellation<L = undefined> extends Canceller<L>, Cancellee<L> {
  readonly close: (reason?: any) => void;
}
export interface Canceller<L = undefined> {
  readonly cancel: {
    (this: Canceller<void>, reason?: L): void;
    (reason: L): void;
  };
}
export interface Cancellee<L = void> {
  readonly register: (listener: (reason: L) => void) => () => void;
  readonly canceled: boolean;
  readonly promise: <T>(val: T) => Promise<T>;
  readonly maybe: <T>(val: T) => Maybe<T>;
  readonly either: <R>(val: R) => Either<L, R>;
}

declare abstract class Lazy<a> {
  abstract extract(): any;
}
declare abstract class Functor<a> extends Lazy<a> {
  abstract fmap<b>(f: (a: a) => b): Functor<b>;
}
declare namespace Functor {
  export function fmap<a, b>(m: Functor<a>, f: (a: a) => b): Functor<b>;
  export function fmap<a>(m: Functor<a>): <b>(f: (a: a) => b) => Functor<b>;
}
export abstract class Applicative<a> extends Functor<a> {
  abstract ap<a, b>(this: Applicative<(a: a) => b>, a: Applicative<a>): Applicative<b>;
}
export namespace Applicative {
  export function pure<a>(a: a): Applicative<a>;
  export function ap<a, b>(af: Applicative<(a: a) => b>, aa: Applicative<a>): Applicative<b>;
  export function ap<a, b>(af: Applicative<(a: a) => b>): (aa: Applicative<a>) => Applicative<b>;
}
declare abstract class Monad<a> extends Applicative<a> {
  abstract bind<b>(f: (a: a) => Monad<b>): Monad<b>;
  abstract join(this: Monad<Monad<a>>): Monad<a>;
}
declare namespace Monad {
  export function Return<a>(a: a): Monad<a>;
  export function bind<a, b>(m: Monad<a>, f: (a: a) => Monad<b>): Monad<b>;
  export function bind<a>(m: Monad<a>): <b>(f: (a: a) => Monad<b>) => Monad<b>;
  export function sequence<a>(ms: Monad<a>[]): Monad<Iterable<a>>;
}
declare abstract class MonadPlus<a> extends Monad<a> {
}
declare namespace MonadPlus {
  export const mzero: MonadPlus<any>;
  export function mplus<a>(ml: MonadPlus<a>, mr: MonadPlus<a>): MonadPlus<a>;
}

export class Sequence<a, z> extends MonadPlus<a> implements Iterable<a> {
  static from<a>(as: Iterable<a>): Sequence<a, [number, Map<number, Sequence.Thunk<a>>]>;
  static cycle<a>(as: Iterable<a>): Sequence<a, [number, Map<number, Sequence.Thunk<a>>]>;
  static random(): Sequence<number, [number, Map<number, Sequence.Thunk<number>>]>;
  static random<a>(gen: () => a): Sequence<a, [number, Map<number, Sequence.Thunk<a>>]>;
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
  static sequence<b>(ms: Sequence<b, any>[]): Sequence<Sequence<b, [Sequence.Iterator<b>, Sequence.Iterator<b>]>, Sequence.Iterator<Sequence<b, [Sequence.Iterator<b>, Sequence.Iterator<b>]>>>;
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
  join<b>(this: Sequence<Sequence<b, any>, any>): Sequence<b, [Sequence.Iterator<Sequence<b, any>>, Sequence.Iterator<b>]>;
  mapM<b>(f: (a: a) => Sequence<b, any>): Sequence<b[], [Sequence.Iterator<Sequence<b[], any>>, Sequence.Iterator<b[]>]>;
  filterM(f: (a: a) => Sequence<boolean, any>): Sequence<a[], [Sequence.Iterator<Sequence<a[], any>>, Sequence.Iterator<a[]>]>;
  map<b>(f: (a: a, i: number) => b): Sequence<b, Sequence.Iterator<a>>;
  filter(f: (a: a, i: number) => boolean): Sequence<a, Sequence.Iterator<a>>;
  scanl<b>(f: (b: b, a: a) => b, z: b): Sequence<b, [b, Sequence.Iterator<a>, number]>;
  foldr<b>(f: (a: a, b: Sequence<b, any>) => Sequence<b, any>, z: Sequence<b, any>): Sequence<b, [Sequence.Iterator<Sequence<b, any>>, Sequence.Iterator<b>]>;
  group(f: (x: a, y: a) => boolean): Sequence<a[], [Sequence.Iterator<a>, a[]]>;
  inits(): Sequence<a[], [Sequence.Iterator<a[]>, Sequence.Iterator<a[]>]>;
  tails(): Sequence<a[], [Sequence.Iterator<a[]>, Sequence.Iterator<a[]>]>;
  segs(): Sequence<a[], [Sequence.Iterator<a[]>, Sequence.Iterator<a[]>]>;
  subsequences(): Sequence<a[], [Sequence.Iterator<a[]>, Sequence.Iterator<a[]>]>;
  permutations(): Sequence<a[], [Sequence.Iterator<Sequence<a[], any>>, Sequence.Iterator<a[]>]>;
  take(n: number): Sequence<a, Sequence.Iterator<a>>;
  drop(n: number): Sequence<a, Sequence.Iterator<a>>;
  takeWhile(f: (a: a) => boolean): Sequence<a, Sequence.Iterator<a>>;
  dropWhile(f: (a: a) => boolean): Sequence<a, Sequence.Iterator<a>>;
  takeUntil(f: (a: a) => boolean): Sequence<a, Sequence.Iterator<a>>;
  dropUntil(f: (a: a) => boolean): Sequence<a, Sequence.Iterator<a>>;
  sort(cmp?: (a: a, b: a) => number): Sequence<a, [number, Map<number, Sequence.Thunk<a>>]>;
  unique(): Sequence<a, Sequence.Iterator<a>>;
  memoize(): Sequence<a, [number, Map<number, Sequence.Thunk<a>>]>;
}
export namespace Sequence {
  export type Data<a, z> = never[] | [a] | [a, z];
  export type Thunk<a> = [a, Iterator<a>, number];
  export type Iterator<a> = () => Thunk<a>;
}

declare namespace Monad {
  export abstract class Maybe<a> extends MonadPlus<a> {
    private readonly MAYBE: Monad.Maybe.Just<a> | Monad.Maybe.Nothing;
    fmap<b extends a>(f: (a: a) => b): Maybe<b>;
    fmap<b>(f: (a: a) => b): Maybe<b>;
    ap<a, z>(this: Maybe<(a: a) => z>, a: Maybe<a>): Maybe<z>;
    ap<a, b, z>(this: Maybe<(a: a, b: b) => z>, a: Maybe<a>): Maybe<(b: b) => z>;
    ap<a, b, c, z>(this: Maybe<(a: a, b: b, c: c) => z>, a: Maybe<a>): Maybe<(b: b, c: c) => z>;
    ap<a, b, c, d, z>(this: Maybe<(a: a, b: b, c: c, d: d) => z>, a: Maybe<a>): Maybe<(b: b, c: c, d: d) => z>;
    ap<a, b, c, d, e, z>(this: Maybe<(a: a, b: b, c: c, d: d, e: e) => z>, a: Maybe<a>): Maybe<(b: b, c: c, d: d, e: e) => z>;
    bind<b extends a>(f: (a: a) => Maybe<b>): Maybe<b>;
    bind<b>(f: (a: a) => Maybe<b>): Maybe<b>;
    guard(cond: boolean): Maybe<a>;
    join<b>(this: Maybe<Maybe<b>>): Maybe<b>;
    extract(): a;
    extract(transform: () => a): a;
    extract<b>(transform: () => b): a | b;
    extract<b>(nothing: () => b, just: (a: a) => b): b;
  }
}
declare namespace Monad.Maybe {
  export class Maybe<a> extends Monad.Maybe<a> {
  }
  export namespace Maybe {
    export function fmap<a, b>(m: Maybe<a>, f: (a: a) => b): Maybe<b>;
    export function fmap<a>(m: Maybe<a>): <b>(f: (a: a) => b) => Maybe<b>;
    export function pure<a>(a: a): Maybe<a>;
    export function ap<a, b>(mf: Maybe<(a: a) => b>, ma: Maybe<a>): Maybe<b>;
    export function ap<a, b>(mf: Maybe<(a: a) => b>): (ma: Maybe<a>) => Maybe<b>;
    export const Return: typeof pure;
    export function bind<a>(m: Maybe<a>, f: (a: a) => Maybe<a>): Maybe<a>;
    export function bind<a, b>(m: Maybe<a>, f: (a: a) => Maybe<b>): Maybe<b>;
    export function bind<a>(m: Maybe<a>): {
      (f: (a: a) => Nothing): Maybe<a>;
      <b>(f: (a: a) => Maybe<b>): Maybe<b>;
    }
    export function sequence<a>(fm: Maybe<a>[]): Maybe<a[]>;
    export function sequence<a>(fm: Maybe<PromiseLike<a>>): AtomicPromise<Maybe<a>>;
    export const mzero: Maybe<never>;
    export function mplus<a>(ml: Maybe<a>, mr: Nothing): Maybe<a>;
    export function mplus<a>(ml: Nothing, mr: Maybe<a>): Maybe<a>;
    export function mplus<a>(ml: Maybe<a>, mr: Maybe<a>): Maybe<a>;
  }
  export class Just<a> extends Maybe<a> {
    private readonly JUST: a;
    bind<b extends a>(f: (a: a) => Maybe<b>): Maybe<b>;
    bind<b>(f: (a: a) => Maybe<b>): Maybe<b>;
    extract(): a;
    extract(transform: () => a): a;
    extract<b>(transform: () => b): a;
    extract<b>(nothing: () => b, just: (a: a) => b): b;
  }
  export class Nothing extends Maybe<never> {
    private readonly NOTHING: void;
    bind<_>(_: (_: never) => Nothing): Nothing;
    bind<a>(_: (_: never) => Maybe<a>): Maybe<a>;
    extract(): never;
    extract<b>(transform: () => b): b;
    extract<b>(nothing: () => b, just: (a: never) => b): b;
  }
}

export type Maybe<a> = Monad.Maybe<a>;
export namespace Maybe {
  export const fmap: typeof Monad.Maybe.fmap;
  export const pure: typeof Monad.Maybe.Maybe.pure;
  export const ap: typeof Monad.Maybe.Maybe.ap;
  export const Return: typeof Monad.Maybe.Maybe.Return;
  export const bind: typeof Monad.Maybe.Maybe.bind;
  export const mzero: typeof Monad.Maybe.Maybe.mzero;
  export const mplus: typeof Monad.Maybe.Maybe.mplus;
}

export function Just<a>(a: a): Maybe<a>;
export const Nothing: Maybe<never>;

declare namespace Monad {
  export abstract class Either<a, b> extends Monad<b> {
    private readonly EITHER: Left<a> | Right<b>;
    fmap<c extends b>(f: (b: b) => c): Either<a, c>;
    fmap<c>(f: (b: b) => c): Either<a, c>;
    ap<b, z>(this: Either<a, (b: b) => z>, b: Either<a, b>): Either<a, z>;
    ap<b, c, z>(this: Either<a, (b: b, c: c) => z>, b: Either<a, b>): Either<a, (c: c) => z>;
    ap<b, c, d, z>(this: Either<a, (b: b, c: c, d: d) => z>, b: Either<a, b>): Either<a, (c: c, d: d) => z>;
    ap<b, c, d, e, z>(this: Either<a, (b: b, c: c, d: d, e: e) => z>, b: Either<a, b>): Either<a, (c: c, d: d, e: e) => z>;
    ap<b, c, d, e, f, z>(this: Either<a, (b: b, c: c, d: d, e: e, f: f) => z>, b: Either<a, b>): Either<a, (c: c, d: d, e: e, f: f) => z>;
    bind<c extends b>(f: (b: b) => Either<a, c>): Either<a, c>;
    bind<c>(f: (b: b) => Either<a, c>): Either<a, c>;
    join<c>(this: Either<a, Either<a, c>>): Either<a, c>;
    extract(): b;
    extract(transform: (a: a) => b): b;
    extract<c>(transform: (a: a) => c): b | c;
    extract<c>(left: (a: a) => c, right: (b: b) => c): c;
  }
}
declare namespace Monad.Either {
  export class Either<a, b> extends Monad.Either<a, b> {
  }
  export namespace Either {
    export function fmap<e, a, b>(m: Either<e, a>, f: (a: a) => b): Either<e, b>;
    export function fmap<e, a>(m: Either<e, a>): <b>(f: (a: a) => b) => Either<e, b>;
    export function pure<b>(b: b): Right<b>;
    export function pure<a, b>(b: b): Either<a, b>;
    export function ap<e, a, b>(mf: Either<e, (a: a) => b>, ma: Either<e, a>): Either<e, b>;
    export function ap<e, a, b>(mf: Either<e, (a: a) => b>): (ma: Either<e, a>) => Either<e, b>;
    export const Return: typeof pure;
    export function bind<e, a, b>(m: Either<e, a>, f: (a: a) => Either<e, b>): Either<e, b>;
    export function bind<e, a>(m: Either<e, a>): <b>(f: (a: a) => Either<e, b>) => Either<e, b>;
    export function sequence<a, b>(fm: Either<a, b>[]): Either<a, b[]>;
    export function sequence<a, b>(fm: Either<a, PromiseLike<b>>): AtomicPromise<Either<a, b>>;
  }
  export class Left<a> extends Either<a, never> {
    private readonly LEFT: a;
    bind<_>(_: (_: never) => Left<a>): Left<a>;
    bind<b>(_: (_: never) => Either<a, b>): Either<a, b>;
    extract(): never;
    extract<c>(transform: (a: a) => c): c;
    extract<c>(left: (a: a) => c, right: (b: never) => c): c;
  }
  export class Right<b> extends Either<never, b> {
    private readonly RIGHT: b;
    bind<c extends b, _ = never>(f: (b: b) => Right<c>): Right<c>
    bind<c, _ = never>(f: (b: b) => Right<c>): Right<c>
    bind<c extends b, a>(f: (b: b) => Either<a, c>): Either<a, c>;
    bind<c, a>(f: (b: b) => Either<a, c>): Either<a, c>;
    bind<a, c>(f: (b: b) => Either<a, c>): Either<a, c>;
    extract(): b;
    extract(transform: (a: never) => b): b;
    extract<c>(transform: (a: never) => c): b;
    extract<c>(left: (a: never) => c, right: (b: b) => c): c;
  }
}

export type Either<a, b> = Monad.Either<a, b>;
export namespace Either {
  export const fmap: typeof Monad.Either.fmap;
  export const pure: typeof Monad.Either.Either.pure;
  export const ap: typeof Monad.Either.Either.ap;
  export const Return: typeof Monad.Either.Either.Return;
  export const bind: typeof Monad.Either.Either.bind;
}

export type Left<a> = Monad.Either.Left<a>;
export function Left<a>(a: a): Left<a>;
export function Left<a, b>(a: a): Either<a, b>;
export type Right<b> = Monad.Either.Right<b>;
export function Right<b>(b: b): Right<b>;
export function Right<a, b>(b: b): Either<a, b>;

export * from './src/type';

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
  <a, z>(f: (a: a) => z, ctx?: any): Curried1<a, z>;
  <a, b, z>(f: (a: a, b: b) => z, ctx?: any): Curried2<a, b, z>;
  <a, b, c, z>(f: (a: a, b: b, c: c) => z, ctx?: any): Curried3<a, b, c, z>;
  <a, b, c, d, z>(f: (a: a, b: b, c: c, d: d) => z, ctx?: any): Curried4<a, b, c, d, z>;
  <a, b, c, d, e, z>(f: (a: a, b: b, c: c, d: d, e: e) => z, ctx?: any): Curried5<a, b, c, d, e, z>;
}
export const curry: Curry;

interface Uncurry {
  <a, z>(f: (a: a) => z): (a: [a]) => z;
  <a, b, z>(f: (a: a, b: b) => z): (a: [a, b]) => z;
  <a, b, c, z>(f: (a: a, b: b, c: c) => z): (a: [a, b, c]) => z;
  <a, b, c, d, z>(f: (a: a, b: b, c: c, d: d) => z): (a: [a, b, c, d]) => z;
  <a, b, c, d, e, z>(f: (a: a, b: b, c: c, d: d, e: e) => z): (a: [a, b, c, d, e]) => z;
}

export const uncurry: Uncurry;

export function flip<a, b, c>(f: (a: a) => (b: b) => c): Curried2<b, a, c>;
export function flip<a, b, c>(f: (a: a, b: b) => c): Curried2<b, a, c>;

export function tuple<a>(t: [a]): [a];
export function tuple<a, b>(t: [a, b]): [a, b];
export function tuple<a, b, c>(t: [a, b, c]): [a, b, c];
export function tuple<a, b, c, d>(t: [a, b, c, d]): [a, b, c, d];
export function tuple<a, b, c, d, e>(t: [a, b, c, d, e]): [a, b, c, d, e];

export interface List<a, c extends Nil | List<a, any>> extends Cons<a, c> { }
export class Nil {
  private readonly NIL: void;
  push<a>(a: a): List<a, Nil>;
}
declare class Cons<a, c extends Nil | List<a, any>> {
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
declare class HCons<a, c extends HNil | HList<any, any>> {
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

export class AtomicPromise<T> implements Promise<T> {
  static [Symbol.species]: typeof AtomicPromise;
  readonly [Symbol.toStringTag]: 'Promise';
  static resolve(): AtomicPromise<void>;
  static resolve<T>(value: T | PromiseLike<T>): AtomicPromise<T>;
  static reject<T = never>(reason?: any): AtomicPromise<T>;
  static all<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>, T9 | PromiseLike<T9>, T10 | PromiseLike<T10>]): AtomicPromise<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]>;
  static all<T1, T2, T3, T4, T5, T6, T7, T8, T9>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>, T9 | PromiseLike<T9>]): AtomicPromise<[T1, T2, T3, T4, T5, T6, T7, T8, T9]>;
  static all<T1, T2, T3, T4, T5, T6, T7, T8>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>]): AtomicPromise<[T1, T2, T3, T4, T5, T6, T7, T8]>;
  static all<T1, T2, T3, T4, T5, T6, T7>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>]): AtomicPromise<[T1, T2, T3, T4, T5, T6, T7]>;
  static all<T1, T2, T3, T4, T5, T6>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>]): AtomicPromise<[T1, T2, T3, T4, T5, T6]>;
  static all<T1, T2, T3, T4, T5>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>, T5 | PromiseLike<T5>]): AtomicPromise<[T1, T2, T3, T4, T5]>;
  static all<T1, T2, T3, T4>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>]): AtomicPromise<[T1, T2, T3, T4]>;
  static all<T1, T2, T3>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>]): AtomicPromise<[T1, T2, T3]>;
  static all<T1, T2>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>]): AtomicPromise<[T1, T2]>;
  static all<T>(values: (T | PromiseLike<T>)[]): AtomicPromise<T[]>;
  static race<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>, T9 | PromiseLike<T9>, T10 | PromiseLike<T10>]): AtomicPromise<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 | T10>;
  static race<T1, T2, T3, T4, T5, T6, T7, T8, T9>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>, T9 | PromiseLike<T9>]): AtomicPromise<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9>;
  static race<T1, T2, T3, T4, T5, T6, T7, T8>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>]): AtomicPromise<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8>;
  static race<T1, T2, T3, T4, T5, T6, T7>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>]): AtomicPromise<T1 | T2 | T3 | T4 | T5 | T6 | T7>;
  static race<T1, T2, T3, T4, T5, T6>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>]): AtomicPromise<T1 | T2 | T3 | T4 | T5 | T6>;
  static race<T1, T2, T3, T4, T5>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>]): AtomicPromise<T1 | T2 | T3 | T4 | T5>;
  static race<T1, T2, T3, T4>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>]): AtomicPromise<T1 | T2 | T3 | T4>;
  static race<T1, T2, T3>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>]): AtomicPromise<T1 | T2 | T3>;
  static race<T1, T2>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>]): AtomicPromise<T1 | T2>;
  static race<T>(values: (T | PromiseLike<T>)[]): AtomicPromise<T>;
  constructor(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void);
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): AtomicPromise<TResult1 | TResult2>;
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): AtomicPromise<T | TResult>;
  finally(onfinally?: (() => void) | undefined | null): AtomicPromise<T>;
}

export class Future<T = undefined> extends Promise<T> {
  static [Symbol.species]: typeof Promise;
  constructor();
  readonly bind: (value: T | PromiseLike<T>) => Promise<T>;
}
export class AtomicFuture<T = undefined> extends AtomicPromise<T> implements Future<T> {
  static [Symbol.species]: typeof AtomicPromise;
  readonly bind: (value: T | PromiseLike<T>) => AtomicPromise<T>;
}

export class Coroutine<T, R = void, S = void> extends Promise<T> implements AsyncIterable<R> {
  protected static readonly run: unique symbol;
  static readonly port: unique symbol;
  protected static readonly destructor: unique symbol;
  static readonly terminator: unique symbol;
  constructor(
    gen: (this: Coroutine<T, R>) => Iterator<T | R> | AsyncIterator<T | R>,
    opts?: CoroutineOptions,
    autorun?: boolean);
  [Symbol.asyncIterator](): AsyncIterableIterator<R>;
  //[Coroutine.port]: CoroutinePort<R, S>;
  //[Coroutine.terminator](reason?: any): void;
  //protected [Coroutine.destructor]: () => void;
}
export interface CoroutineOptions {
  readonly resume?: () => PromiseLike<void>;
  readonly size?: number;
}
export interface CoroutinePort<R, S> {
  readonly send: (msg: S | PromiseLike<S>) => Promise<IteratorResult<R>>;
  readonly recv: () => Promise<IteratorResult<R>>;
}

export class Colistener<T, U = void> extends Coroutine<U, T> {
  constructor(
    listen: (listener: (this: Colistener<T, U>, value: T) => void) => () => void,
    opts?: CoroutineOptions);
  readonly close: {
    (this: Colistener<T, void>, value?: U): void;
    (value: U): void;
  };
}

export function cofetch(url: string, opts?: CofetchOptions): Cofetch;
interface Cofetch extends Coroutine<XMLHttpRequest, ProgressEvent> {
  readonly cancel: () => void;
}
export interface CofetchOptions {
  method?: string;
  headers?: Headers;
  body?: FormData | null;
  responseType?: XMLHttpRequestResponseType;
  timeout?: number;
  withCredentials?: boolean;
}

export interface WeakMapLike<K, V> {
  get(key: K): V | undefined;
  set(key: K, value: V): this;
  has(key: K): boolean;
  delete(key: K): boolean;
}
export class DataMap<K, V> implements WeakMapLike<K, V> {
  constructor(
    entries?: Iterable<[K, V]>);
  get(key: K): V | undefined;
  set(key: K, val: V): this;
  has(key: K): boolean;
  delete(key: K): boolean;
  clear(): void;
  size: number;
}
export class AttrMap<C, K, V> {
  constructor(
    entries?: Iterable<[C, K, V]>,
    KeyMap?: new <K, V>(entries?: Iterable<[K, V]>) => WeakMapLike<K, V>,
    ValueMap?: new <K, V>(entries?: Iterable<[K, V]>) => WeakMapLike<K, V>);
  get(ctx: C, key: K): V | undefined;
  set(ctx: C, key: K, val: V): this;
  has(ctx: C): boolean;
  has(ctx: C, key: K): boolean;
  delete(ctx: C): boolean;
  delete(ctx: C, key: K): boolean;
}

export class Cache<K, V = void> {
  constructor(
    size: number,
    callback?: (key: K, value: V) => void,
    opts?: {
      ignore?: {
        delete?: boolean;
        clear?: boolean;
      };
      data?: {
        stats: [K[], K[]];
        entries: [K, V][];
      };
    },
  );
  put(key: K, value: V, log?: boolean): boolean;
  put(this: Cache<K, void>, key: K): boolean;
  set<W extends V>(this: Cache<K, void>, key: K, value?: W): W;
  set<W extends V>(key: K, value: W, log?: boolean): W;
  get(key: K, log?: boolean): V | undefined;
  has(key: K): boolean;
  delete(key: K): boolean;
  clear(): void;
  [Symbol.iterator](): Iterator<[K, V]>;
  export(): { stats: [K[], K[]]; entries: [K, V][]; };
}

export function tick(fn: () => void, dedup?: boolean): void;
export function wait(ms: number): Promise<void>;
export function throttle<T>(interval: number, callback: (last: T, buffer: T[]) => void): (arg: T) => void;
export function debounce<T>(delay: number, callback: (last: T, buffer: T[]) => void): (arg: T) => void;

export function uuid(): string;
export function sqid(): string;
export function sqid(id: number): string;
export function assign<T extends U, U extends object>(target: T, ...sources: Partial<U>[]): T;
export function assign<T extends U, U extends object>(target: object, source: T, ...sources: Partial<U>[]): T;
export function assign<T extends object>(target: T, ...sources: Partial<T>[]): T;
export function assign<T extends object>(target: object, source: T, ...sources: Partial<T>[]): T;
export function clone<T extends U, U extends object>(target: T, ...sources: Partial<U>[]): T;
export function clone<T extends U, U extends object>(target: object, source: T, ...sources: Partial<U>[]): T;
export function clone<T extends object>(target: T, ...sources: Partial<T>[]): T;
export function clone<T extends object>(target: object, source: T, ...sources: Partial<T>[]): T;
export function extend<T extends U, U extends object>(target: T, ...sources: Partial<U>[]): T;
export function extend<T extends U, U extends object>(target: object, source: T, ...sources: Partial<U>[]): T;
export function extend<T extends object>(target: T, ...sources: Partial<T>[]): T;
export function extend<T extends object>(target: object, source: T, ...sources: Partial<T>[]): T;
export function concat<T>(target: T[], source: T[]): T[];
export function concat<T>(target: T[], source: { [index: number]: T; length: number; }): T[];
export function sort<T>(as: T[], cmp: (a: T, b: T) => number, times: number): T[];
