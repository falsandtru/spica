import {Monad} from './monad';

export abstract class MonadPlus<a> extends Monad<a> {
  public static mzero: MonadPlus<any>;
  public static mplus: <a>(ml: MonadPlus<a>, mr: MonadPlus<a>) => MonadPlus<a>;
}
