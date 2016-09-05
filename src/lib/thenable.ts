export function isThenable(target: any): target is PromiseLike<any> {
  return !!target
      && typeof target === 'object'
      && typeof target.then === 'function';
}
