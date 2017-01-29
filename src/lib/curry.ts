import { Curry } from '../../index.d';

export const curry: Curry = <T>(f: () => T, ctx?: any) =>
  f.length === 0
    ? () => f.call(ctx)
    : curry_(f, [], ctx);

function curry_(f: (...ys: any[]) => any, xs: any[], ctx: any) {
  return f.length === xs.length
    ? f.apply(ctx, xs)
    : (...ys: any[]) => curry_(f, xs.concat(ys), ctx);
}
