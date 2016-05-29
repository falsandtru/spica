export function isThenable(target: any): target is PromiseLike<any> {
  return !!target
      && typeof target === 'object'
      && target.then !== void 0;
}
