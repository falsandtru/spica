import { Curried2 } from './curry';

export function flip<a, b, c>(f: (a: a) => (b: b) => c): (b: b) => (a: a) => c;
export function flip<a, b, c>(f: (a: a, b: b) => c): (b: b, a: a) => c;
export function flip<a, b, c>(f: ((a: a, b: b) => c) | ((a: a) => (b: b) => c)): Curried2<b, a, c>;
export function flip<a, b, c>(f: ((a: a, b: b) => c) | ((a: a) => (b: b) => c)): any {
  const arity = f.length;
  return arity > 1
    ? (b: b, a: a) => f(a, b) as c
    : (b: b, ...as: a[]) =>
        as.length === 0
          ? (a: a) => (<(a: a) => (b: b) => c>f)(a)(b)
          : (<(a: a) => (b: b) => c>f)(as[0])(b) as c;
}
