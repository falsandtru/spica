import { RewriteProp } from './type';

export function fanOut<c1, c2>(a1: () => c1, a2: () => c2): () => [c1, c2];
export function fanOut<as extends readonly (() => unknown)[]>(...as: as): () => RewriteProp<as, [as[0], ReturnType<as[0]>]>;
export function fanOut<b, c1, c2>(a1: (b: b) => c1, a2: (b: b) => c2): (b: b) => [c1, c2];
export function fanOut<as extends readonly ((b: unknown) => unknown)[]>(...as: as): (b: Parameters<as[0]>[0]) => RewriteProp<as, [as[0], ReturnType<as[0]>]>;
export function fanOut<as extends readonly ((b: unknown) => unknown)[]>(...as: as): (b: Parameters<as[0]>[0]) => RewriteProp<as, [as[0], ReturnType<as[0]>]> {
  return b => as.map(f => f(b)) as any;
}
