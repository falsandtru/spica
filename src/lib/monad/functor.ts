import {Lazy} from './lazy';

export abstract class Functor<T> extends Lazy<T> {
  public abstract fmap<U>(f: (val: T) => U): Functor<U>;
}
