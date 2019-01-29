export interface Curried0<z> {
  (): z;
}
export interface Curried1<a, z> {
  (a: a): z;
}
export interface Curried2<a, b, z> {
  (a: a, b: b): z;
  (a: a): Curried1<b, z>;
}
export interface Curried3<a, b, c, z> {
  (a: a, b: b, c: c): z;
  (a: a, b: b): Curried1<c, z>;
  (a: a): Curried2<b, c, z>;
}
export interface Curried4<a, b, c, d, z> {
  (a: a, b: b, c: c, d: d): z;
  (a: a, b: b, c: c): Curried1<d, z>;
  (a: a, b: b): Curried2<c, d, z>;
  (a: a): Curried3<b, c, d, z>;
}
export interface Curried5<a, b, c, d, e, z> {
  (a: a, b: b, c: c, d: d, e: e): z;
  (a: a, b: b, c: c, d: d): Curried1<e, z>;
  (a: a, b: b, c: c): Curried2<d, e, z>;
  (a: a, b: b): Curried3<c, d, e, z>;
  (a: a): Curried4<b, c, d, e, z>;
}
export interface Curry {
  <z>(f: () => z, ctx?: any): Curried0<z>;
  <a, z>(f: (a: a) => z, ctx?: any): Curried1<a, z>;
  <a, b, z>(f: (a: a, b: b) => z, ctx?: any): Curried2<a, b, z>;
  <a, b, c, z>(f: (a: a, b: b, c: c) => z, ctx?: any): Curried3<a, b, c, z>;
  <a, b, c, d, z>(f: (a: a, b: b, c: c, d: d) => z, ctx?: any): Curried4<a, b, c, d, z>;
  <a, b, c, d, e, z>(f: (a: a, b: b, c: c, d: d, e: e) => z, ctx?: any): Curried5<a, b, c, d, e, z>;
}

export const curry: Curry = <Curry>((f: () => any, ctx?: any) =>
  f.length === 0
    ? f.bind(ctx)
    : curry_(f, [], ctx));

function curry_(f: (...ys: any[]) => any, xs: any[], ctx: any) {
  return xs.length >= f.length
    ? f.apply(ctx, xs)
    : (...ys: any[]) => curry_(f, xs.concat(ys), ctx);
}
