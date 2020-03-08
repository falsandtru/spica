import { isArray } from './alias';

export function indexOf<a>(as: readonly a[], a: a): number {
  return a === a
    ? as.indexOf(a)
    : as.findIndex(a => a !== a);
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
    for (let i = as.length - 1; i >= 0; --i) {
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
          return [[as.shift()!], unshift(inserts, as)][0];
      }
      break;
    case -1:
    case as.length - 1:
      switch (count) {
        case 0:
          return [[], push(as, inserts)][0];
        case 1:
          return [[as.pop()!], push(as, inserts)][0];
      }
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
