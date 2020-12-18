export function reduceParameters<a, b, c>(f: (b: b) => c, g: (as: a[]) => b): (...as: a[]) => c {
  return (...as) => f(g(as));
}

export function reduceReturns<a, b, c>(f: (...as: a[]) => b[], g: (bs: b[]) => c): (...as: a[]) => c {
  return (...as) => g(f(...as));
}
