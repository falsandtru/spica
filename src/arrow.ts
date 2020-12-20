type Functions2Parameters<FS extends readonly ((..._: unknown[]) => unknown)[]> = { [P in keyof FS]: FS[P] extends FS[number] ? Parameters<FS[P]>[0] : never; };
type Functions2Returns<FS extends readonly ((..._: unknown[]) => unknown)[]> = { [P in keyof FS]: FS[P] extends FS[number] ? ReturnType<FS[P]> : never; };

export function bundle<as extends ((b: unknown) => unknown)[]>(...as: as): (...bs: Functions2Parameters<as>) => Functions2Returns<as> {
  return (...bs) => as.map((f, i) => f(bs[i])) as any;
}

export function aggregate<as extends (() => unknown)[]>(...as: as): () => Functions2Returns<as>;
export function aggregate<as extends ((b: unknown) => unknown)[]>(...as: as): (b: Parameters<as[0]>[0]) => Functions2Returns<as>;
export function aggregate<as extends ((b: unknown) => unknown)[]>(...as: as): (b: Parameters<as[0]>[0]) => Functions2Returns<as> {
  return b => as.map(f => f(b)) as any;
}
