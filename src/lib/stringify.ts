export function stringify(target: any): string {
  try {
    return target instanceof Error && typeof target.stack === 'string'
      ? target.stack
      : 'toString' in target && typeof target.toString === 'function'
        ? target + ''
        : Object.prototype.toString.call(target);
  }
  catch (reason) {
    return stringify(reason);
  }
}
