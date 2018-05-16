export function wait(ms: number): Promise<void> {
  assert(ms >= 0);
  return new Promise(resolve => void setTimeout(resolve, ms));
}
