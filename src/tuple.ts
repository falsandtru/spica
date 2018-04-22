export function tuple<a>(t: [a]): [a];
export function tuple<a, b>(t: [a, b]): [a, b];
export function tuple<a, b, c>(t: [a, b, c]): [a, b, c];
export function tuple<a, b, c, d>(t: [a, b, c, d]): [a, b, c, d];
export function tuple<a, b, c, d, e>(t: [a, b, c, d, e]): [a, b, c, d, e];
export function tuple<a>(as: a[]): a[] {
  return as;
}
