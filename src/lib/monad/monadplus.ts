import { Monad } from './monad';

export abstract class MonadPlus<a> extends Monad<a> {
}
export namespace MonadPlus {
  export declare const mzero: MonadPlus<any>;
  export declare function mplus<a>(ml: MonadPlus<a>, mr: MonadPlus<a>): MonadPlus<a>;
}
