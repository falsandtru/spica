import { Lazy } from './lazy';

export abstract class Functor<a> extends Lazy<a> {
  abstract fmap<b>(f: (a: a) => b): Functor<b>;
}
export namespace Functor {
  export function fmap<a, b>(f: (a: a) => b, m: Functor<a>): Functor<b> {
    return m.fmap(f);
  }
}
