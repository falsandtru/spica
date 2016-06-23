import {Monad} from './monad';

export abstract class MonadPlus<T> extends Monad<T> {
  public static mzero: MonadPlus<any>;
  public static mplus: <T>(a: MonadPlus<T>, b: MonadPlus<T>) => MonadPlus<T>;
}
