import { undefined, Infinity } from './global';

export function indexOf<a>(as: readonly a[], a: a): number {
  return a === a
    ? as.indexOf(a)
    : as.findIndex(a => a !== a);
}

export function unshift<as extends readonly unknown[], b>(as: as, bs: b[]): [...as, ...b[]];
export function unshift<a>(as: Iterable<a> | ArrayLike<a>, bs: a[]): a[];
export function unshift<a>(as: Iterable<a> | ArrayLike<a>, bs: a[]): a[] {
  if ('length' in as) {
    for (let i = as.length - 1; i >= 0; --i) {
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
  return count === undefined
    ? [as.shift(), as]
    : [splice(as, 0, count), as];
}

export function push<a, bs extends readonly unknown[]>(as: a[], bs: bs): [...a[], ...bs];
export function push<a>(as: a[], bs: Iterable<a> | ArrayLike<a>): a[];
export function push<a>(as: a[], bs: Iterable<a> | ArrayLike<a>): a[] {
  if ('length' in bs) {
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
  return count === undefined
    ? [as, as.pop()]
    : [as, splice(as, as.length - count, count)];
}

export function splice<a>(as: a[], index: number, count?: number): a[];
export function splice<a>(as: a[], index: number, count: number, ...inserts: a[]): a[];
export function splice<a>(as: a[], index: number, count?: number, ...inserts: a[]): a[] {
  if (count === 0 && inserts.length === 0) return [];
  count = count! > as.length
    ? as.length
    : count;
  switch (index) {
    case 0:
      switch (count) {
        case 0:
          return [[], unshift(inserts, as)][0];
        case 1:
          return as.length === 0
            ? [[], unshift(inserts, as)][0]
            : [[as.shift()!], unshift(inserts, as)][0];
        case undefined:
          if (as.length > 1 || arguments.length > 2) break;
          return as.length === 0
            ? []
            : splice(as, index, 1);
      }
      break;
    case -1:
    case as.length - 1:
      switch (count) {
        case 1:
          return as.length === 0
            ? [[], push(as, inserts)][0]
            : [[as.pop()!], push(as, inserts)][0];
        case undefined:
          if (as.length > 1 || arguments.length > 2) break;
          return as.length === 0
            ? []
            : splice(as, index, 1);
      }
      break;
    case as.length:
    case Infinity:
      return [[], push(as, inserts)][0];
  }
  return arguments.length > 2
    ? as.splice(index, count!, ...inserts)
    : as.splice(index);
}

export function join(as: readonly (string | number)[], sep = ''): string {
  let acc = '';
  for (let i = 0; i < as.length; ++i) {
    acc += i === 0
      ? as[i]
      : sep + as[i];
  }
  return acc;
}
