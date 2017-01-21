import { Lazy } from './lazy';

export abstract class Functor<a> extends Lazy<a> {
  abstract fmap<b>(f: (a: a) => b): Functor<b>;
}
export namespace Functor {
  export function fmap<a, b>(m: Functor<a>, f: (a: a) => b): Functor<b>;
  export function fmap<a>(m: Functor<a>): <b>(f: (a: a) => b) => Functor<b>;
  export function fmap<a, b>(m: Functor<a>, f?: (a: a) => b): Functor<b> | ((f: (a: a) => b) => Functor<b>) {
    return f
      ? m.fmap(f)
      : (f: (a: a) => b) => m.fmap(f);
  }
}
