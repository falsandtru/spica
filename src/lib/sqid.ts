let cnt = 0;

export function sqid(): string
export function sqid(id: number): string
export function sqid(id?: number): string {
  return id === void 0
    ? (1e15 + ++cnt + '').slice(1)
    : (1e15 + id + '').slice(1);
}
