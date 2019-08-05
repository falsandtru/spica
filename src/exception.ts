export function causeAsyncException(reason: unknown): void {
  assert(!void console.error(reason));
  void new Promise((_, reject) =>
    void reject(reason));
}
