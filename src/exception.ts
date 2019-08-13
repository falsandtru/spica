export function causeAsyncException(reason: unknown): void {
  assert(!void console.error(reason));
  void Promise.reject(reason);
}
