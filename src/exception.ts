export function causeAsyncException(reason: unknown): void {
  assert(!+console.error(reason));
  void Promise.reject(reason);
}
