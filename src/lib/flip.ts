import { Curried2 } from '../../index.d';
import { curry } from './curry';

export function flip<a, b, c>(f: (a: a) => (b: b) => c): Curried2<b, a, c>
export function flip<a, b, c>(f: (a: a, b: b) => c): Curried2<b, a, c>
export function flip<a, b, c>(f: ((a: a, b: b) => c) | ((a: a) => (b: b) => c)): Curried2<b, a, c> {
  return curry((b: b, a: a) =>
    f.length > 1
      ? (<(a: a, b: b) => c>f)(a, b)
      : (<(a: a) => (b: b) => c>f)(a)(b));
}
