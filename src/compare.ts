export function equal(a: unknown, b: unknown): boolean {
  return a === a
    ? a === b
    : b !== b;
}
