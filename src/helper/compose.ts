export function compose<T extends new (...args: unknown[]) => object>(target: T, ...sources: T[]): T {
  return sources
    .reduce((b, d) => {
      Object.getOwnPropertyNames(d.prototype)
        .filter(p => !(p in b.prototype))
        .forEach(p => b.prototype[p] = d.prototype[p]);
      Object.getOwnPropertyNames(d)
        .filter(p => !(p in b))
        .forEach(p => b[p] = d[p]);
      return b;
    }
    , target);
}
