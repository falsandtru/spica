type Functions2Parameters<FS extends readonly ((..._: unknown[]) => unknown)[]> = { [P in keyof FS]: FS[P] extends FS[number] ? Parameters<FS[P]>[0] : never; };
type Functions2Returns<FS extends readonly ((..._: unknown[]) => unknown)[]> = { [P in keyof FS]: FS[P] extends FS[number] ? ReturnType<FS[P]> : never; };
type Functions2Context<FS extends readonly ((..._: unknown[]) => unknown)[]> = FS[number] extends (this: infer C, ..._: unknown[]) => unknown ? C : never;

export function bundle<as extends ((this: undefined, b: unknown) => unknown)[]>(...as: as): (...bs: Functions2Parameters<as>) => Functions2Returns<as>;
export function bundle<as extends ((b: unknown) => unknown)[]>(...as: as): (this: Functions2Context<as>, ...bs: Functions2Parameters<as>) => Functions2Returns<as>;
export function bundle<as extends ((b: unknown) => unknown)[]>(...as: as): (this: Functions2Context<as>, ...bs: Functions2Parameters<as>) => Functions2Returns<as> {
  return function (...bs) {
    return as.map((f, i) => f.call(this, bs[i])) as any;
  };
}

export function aggregate<as extends ((this: undefined) => unknown)[]>(...as: as): () => Functions2Returns<as>;
export function aggregate<as extends (() => unknown)[]>(...as: as): (this: Functions2Context<as>) => Functions2Returns<as>;
export function aggregate<as extends ((this: undefined, b: unknown) => unknown)[]>(...as: as): (b: Parameters<as[0]>[0]) => Functions2Returns<as>;
export function aggregate<as extends ((b: unknown) => unknown)[]>(...as: as): (this: Functions2Context<as>, b: Parameters<as[0]>[0]) => Functions2Returns<as>;
export function aggregate<as extends ((b: unknown) => unknown)[]>(...as: as): (this: Functions2Context<as>, b: Parameters<as[0]>[0]) => Functions2Returns<as> {
  return function (b) {
    return as.map(f => f.call(this, b)) as any;
  };
}
