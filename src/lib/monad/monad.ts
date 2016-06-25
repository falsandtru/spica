import {Applicative} from './applicative';

export abstract class Monad<a> extends Applicative<a> {
  public abstract bind<b>(f: (a: a) => Monad<b>): Monad<b>;
}
export namespace Monad {
  export declare function Return<a>(a: a): Monad<a>;
}
