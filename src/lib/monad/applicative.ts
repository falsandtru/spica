import {Functor} from './functor';

export abstract class Applicative<T> extends Functor<T> {
}
export namespace Applicative {
  export declare function pure<a>(a: a): Applicative<a>;
  export declare function ap<a, b>(f: Applicative<(a: a) => b>): (a: Applicative<a>) => Applicative<b>;
}
