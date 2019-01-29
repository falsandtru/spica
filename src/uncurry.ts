interface Uncurry {
  <z>(f: () => z): (xs: []) => z;
  <a, z>(f: (a: a) => z): (xs: [a]) => z;
  <a, b, z>(f: (a: a, b: b) => z): (xs: [a, b]) => z;
  <a, b, c, z>(f: (a: a, b: b, c: c) => z): (xs: [a, b, c]) => z;
  <a, b, c, d, z>(f: (a: a, b: b, c: c, d: d) => z): (xs: [a, b, c, d]) => z;
  <a, b, c, d, e, z>(f: (a: a, b: b, c: c, d: d, e: e) => z): (xs: [a, b, c, d, e]) => z;
}

export const uncurry: Uncurry = <Uncurry>(<x, z>(f: (...xs: x[]) => z) =>
  (xs: x[]) => f(...xs));
