import {Lazy} from './lazy';

export abstract class Functor<a> extends Lazy<a> {
  abstract fmap<b>(f: (a: a) => b): Functor<b>;
}
