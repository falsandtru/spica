import { curry, Curried2 } from './curry';

export function flip<a, b, c>(f: (a: a) => (b: b) => c): (b: b) => (a: a) => c
export function flip<a, b, c>(f: (a: a, b: b) => c): (b: b, a: a) => c
export function flip<a, b, c>(f: ((a: a, b: b) => c) | ((a: a) => (b: b) => c)): Curried2<b, a, c>
export function flip<a, b, c>(f: ((a: a, b: b) => c) | ((a: a) => (b: b) => c)): Curried2<b, a, c> {
  return f.length > 1
    ? curry((b: b, a: a) => (<(a: a, b: b) => c>f)(a, b))
    : curry((b: b, a: a) => (<(a: a) => (b: b) => c>f)(a)(b));
}
