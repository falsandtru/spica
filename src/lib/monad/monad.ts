import {Functor} from './functor';

export abstract class Monad<T> extends Functor<T> {
  public abstract bind<U>(f: (val: T) => Monad<U>): Monad<U>;
}
