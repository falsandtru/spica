import {Functor} from './functor';

export abstract class Applicative<a> extends Functor<a> {
  public abstract fmap<b>(f: (a: a) => b): Applicative<b>;
  public abstract bind<b>(f: (a: a) => Applicative<b>): Applicative<b>;
}
export namespace Applicative {
  export declare function pure<a>(a: a): Applicative<a>;
  export function ap<a, b>(ff: Applicative<(a: a) => b>, fa: Applicative<a>): Applicative<b>;
  export function ap<a, b>(ff: Applicative<(a: a) => b>): (fa: Applicative<a>) => Applicative<b>;
  export function ap<a, b>(ff: Applicative<(a: a) => b>, fa?: Applicative<a>): Applicative<b> | ((fa: Applicative<a>) => Applicative<b>) {
    return fa
      ? ff.bind(f => fa.fmap(a => f(a)))
      : (fa: Applicative<a>) => ff.bind(f => fa.fmap(a => f(a)));
  }
}
