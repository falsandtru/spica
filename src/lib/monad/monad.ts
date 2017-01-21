import { Applicative } from './applicative';

export abstract class Monad<a> extends Applicative<a> {
  public abstract bind<b>(f: (a: a) => Monad<b>): Monad<b>;
}
export namespace Monad {
  export declare function Return<a>(a: a): Monad<a>;
  export function bind<a, b>(m: Monad<a>, f: (a: a) => Monad<b>): Monad<b>;
  export function bind<a>(m: Monad<a>): <b>(f: (a: a) => Monad<b>) => Monad<b>;
  export function bind<a, b>(m: Monad<a>, f?: (a: a) => Monad<b>): Monad<b> | (<b>(f: (a: a) => Monad<b>) => Monad<b>) {
    return f
      ? m.bind(f)
      : (f: (a: a) => Monad<b>) => bind(m, f);
  }
}
