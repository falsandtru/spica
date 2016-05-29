import {Lazy} from './lazy';

export abstract class Functor<T> extends Lazy<T> {
  private FUNCTOR: T;
  public abstract fmap<U>(f: (val: T) => U): Functor<U>;
}
