import { Functor } from './functor';
import { curry } from '../curry';

export abstract class Applicative<a> extends Functor<a> {
  public abstract fmap<b>(f: (a: a) => b): Applicative<b>;
  public abstract ap<a, b>(this: Applicative<(a: a) => b>, a: Applicative<a>): Applicative<b>;
  public abstract bind<b>(f: (a: a) => Applicative<b>): Applicative<b>;
}
export namespace Applicative {
  export declare function pure<a>(a: a): Applicative<a>;
  export function ap<a, b>(af: Applicative<(a: a) => b>, aa: Applicative<a>): Applicative<b>;
  export function ap<a, b>(af: Applicative<(a: a) => b>): (aa: Applicative<a>) => Applicative<b>;
  export function ap<a, b>(af: Applicative<(a: a) => b>, aa?: Applicative<a>): Applicative<b> | ((aa: Applicative<a>) => Applicative<b>) {
    return aa
      ? af.bind(f => aa.fmap(curry(f)))
      : (aa: Applicative<a>) => ap(af, aa);
  }
}
