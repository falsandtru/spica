import {Functor} from './functor';

export abstract class Applicative<a> extends Functor<a> {
}
export namespace Applicative {
  export declare function pure<a>(a: a): Applicative<a>;
  export declare function ap<a, b>(ff: Applicative<(a: a) => b>): (fa: Applicative<a>) => Applicative<b>;
}
