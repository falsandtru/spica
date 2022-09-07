import { Symbol } from './global';

export function indexOf<a>(as: readonly a[], a: a): number {
  if (as.length === 0) return -1;
  return a === a
    ? as.indexOf(a)
    : as.findIndex(a => a !== a);
}

export function unshift<as extends readonly unknown[], b>(as: as, bs: b[]): [...as, ...b[]];
export function unshift<a>(as: Iterable<a> | ArrayLike<a>, bs: a[]): a[];
export function unshift<a>(as: Iterable<a> | ArrayLike<a>, bs: a[]): a[] {
  if ('length' in as) {
    if (Symbol.iterator in as) return bs.unshift(...as as a[]), bs;
    for (let i = as.length; i--;) {
      bs.unshift(as[i]);
    }
  }
  else {
    bs.unshift(...as);
  }
  return bs;
}

export function shift<a, b>(as: [a, ...b[]]): [a, b[]];
export function shift<a>(as: a[]): [a | undefined, a[]];
export function shift<a>(as: a[], count: number): [a[], a[]];
export function shift<a>(as: a[], count?: number): [a | undefined | a[], a[]] {
  if (count! < 0) throw new Error('Unexpected negative number');
  return count === void 0
    ? [as.shift(), as]
    : [splice(as, 0, count), as];
}

export function push<a, bs extends readonly unknown[]>(as: a[], bs: bs): [...a[], ...bs];
export function push<a>(as: a[], bs: Iterable<a> | ArrayLike<a>): a[];
export function push<a>(as: a[], bs: Iterable<a> | ArrayLike<a>): a[] {
  if ('length' in bs) {
    if (Symbol.iterator in bs && bs.length > 50) return as.push(...bs as a[]), as;
    for (let i = 0, len = bs.length; i < len; ++i) {
      as.push(bs[i]);
    }
  }
  else {
    for (const b of bs) {
      as.push(b);
    }
  }
  return as;
}

export function pop<a, b>(as: [...a[], b]): [a[], b];
export function pop<a>(as: a[]): [a[], a | undefined];
export function pop<a>(as: a[], count: number): [a[], a[]];
export function pop<a>(as: a[], count?: number): [a[], a | undefined | a[]] {
  if (count! < 0) throw new Error('Unexpected negative number');
  return count === void 0
    ? [as, as.pop()]
    : [as, splice(as, as.length - count, count)];
}

export function splice<a>(as: a[], index: number, count?: number): a[];
export function splice<a>(as: a[], index: number, count: number, ...values: a[]): a[];
export function splice<a>(as: a[], index: number, count?: number, ...values: a[]): a[] {
  if (as.length === 0) return push(as, values), [];
  if (index > as.length) {
    index = as.length;
  }
  else if (index < 0) {
    index = -index > as.length
      ? 0
      : as.length + index;
  }
  count = count! > as.length
    ? as.length
    : count;
  if (count === 0 && values.length === 0) return [];
  if (count === 1 && values.length === 1) return [[as[index], as[index] = values[0]][0]];
  switch (index) {
    case 0:
      if (count === 0) return unshift(values, as), [];
      if (count === 1) return [[as.shift()!], unshift(values, as)][0];
      break;
    case as.length - 1:
      if (count === 1) return [[as.pop()!], push(as, values)][0];
      break;
    case as.length:
      return push(as, values), [];
  }
  return arguments.length > 2
    ? as.splice(index, count!, ...values)
    : as.splice(index);
}
