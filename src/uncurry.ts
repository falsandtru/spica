interface Uncurry {
  <a, b, c, d, e, z>(f: (a: a) => (b: b) => (c: c) => (d: d) => (e: e) => z): (a: a, b: b, c: c, d: d, e: e) => z;
  <a, b, c, d, z>(f: (a: a) => (b: b) => (c: c) => (d: d) => z): (a: a, b: b, c: c, d: d) => z;
  <a, b, c, z>(f: (a: a) => (b: b) => (c: c) => z): (a: a, b: b, c: c) => z;
  <a, b, z>(f: (a: a) => (b: b) => z): (a: a, b: b) => z;
  <a, z>(f: (a: a) => z): (a: a) => z;
}

export const uncurry: Uncurry = (f: (a: any) => any) => (...args: any[]) =>
  args.reduce((f, arg) => f(arg), f);
