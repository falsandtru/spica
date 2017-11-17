interface Uncurry {
  <a, z>(f: (a: a) => z): (a: [a]) => z;
  <a, b, z>(f: (a: a, b: b) => z): (a: [a, b]) => z;
  <a, b, c, z>(f: (a: a, b: b, c: c) => z): (a: [a, b, c]) => z;
  <a, b, c, d, z>(f: (a: a, b: b, c: c, d: d) => z): (a: [a, b, c, d]) => z;
  <a, b, c, d, e, z>(f: (a: a, b: b, c: c, d: d, e: e) => z): (a: [a, b, c, d, e]) => z;
}

export const uncurry: Uncurry = <Uncurry>(<a, z>(f: (...as: a[]) => z) =>
  (as: a[]) => f(...as.slice(0, f.length)));
