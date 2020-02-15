import { isArray } from './alias';

export function indexOf<a>(as: readonly a[], a: a): number {
  const isNaN = a !== a;
  for (let i = 0; i < as.length; ++i) {
    const ai = as[i];
    if (isNaN ? ai !== ai : ai === a) return i;
  }
  return -1;
}

export function shift<a>(as: [a, ...a[]]): [a, a[]];
export function shift<a>(as: a[]): [a | undefined, a[]];
export function shift<a>(as: [a, ...a[]], count: number): [a[], a[]];
export function shift<a>(as: a[], count: number): [a[], a[]];
export function shift<a>(as: a[], count?: number): [a | undefined | a[], a[]] {
  if (count! < 0) throw new Error('Unexpected negative number');
  return count === void 0
    ? [as.shift(), as]
    : [as.splice(0, count), as];
}
export function unshift<a>(as: Iterable<a>, bs: a[]): a[] {
  if (isArray(as)) {
    for (let i = as.length; i--;) {
      bs.unshift(as[i]);
    }
  }
  else {
    bs.unshift(...as);
  }
  return bs;
}
export function pop<a>(as: [a, ...a[]]): [a[], a];
export function pop<a>(as: a[]): [a[], a | undefined];
export function pop<a>(as: [a, ...a[]], count: number): [a[], a[]];
export function pop<a>(as: a[], count: number): [a[], a[]];
export function pop<a>(as: a[], count?: number): [a[], a | undefined | a[]] {
  if (count! < 0) throw new Error('Unexpected negative number');
  return count === void 0
    ? [as, as.pop()]
    : [as, as.splice(as.length - count, count)];
}
export function push<a>(as: a[], bs: Iterable<a>): a[] {
  if (isArray(bs)) {
    for (let i = 0; i < bs.length; ++i) {
      as.push(bs[i]);
    }
  }
  else {
    as.push(...bs);
  }
  return as;
}
