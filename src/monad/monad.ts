import { Applicative } from './applicative';

export abstract class Monad<a> extends Applicative<a> {
  public abstract override bind<b>(f: (a: a) => Monad<b>): Monad<b>;
  public abstract join(this: Monad<Monad<a>>): Monad<a>;
}
export namespace Monad {
  export declare function Return<a>(a: a): Monad<a>;
  export function bind<a, b>(f: (a: a) => Monad<b>, m: Monad<a>): Monad<b> {
    return m.bind(f);
  }
  export declare function sequence<a>(fm: Monad<a>[]): Monad<Iterable<a>>;
  //export declare function sequence<a>(fm: Monad<PromiseLike<a>>): AtomicPromise<Monad<a>>;
}
