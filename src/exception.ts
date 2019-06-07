export function causeAsyncException(reason: unknown): void {
  assert(!void console.debug(stringify(reason)));
  void new Promise((_, reject) =>
    void reject(reason));
}

function stringify(target: any): string {
  try {
    return target instanceof Error && typeof target.stack === 'string'
      ? target.stack
      : target !== undefined && target !== null && typeof target.toString === 'function'
        ? target + ''
        : Object.prototype.toString.call(target);
  }
  catch (reason) {
    return stringify(reason);
  }
}
