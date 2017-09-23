export function compose<T extends new (...args: any[]) => object>(target: T, ...sources: T[]): T {
  return sources
    .reduce((b, d) => {
      void Object.getOwnPropertyNames(d.prototype)
        .filter(p => !(p in b.prototype))
        .forEach(p => b.prototype[p] = d.prototype[p]);
      void Object.getOwnPropertyNames(d)
        .filter(p => !(p in b))
        .forEach(p => b[p] = d[p]);
      return b;
    }
    , target);
}
