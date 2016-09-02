let cnt = 0;

export function sqid(): string
export function sqid(id: number): string
export function sqid(id?: number): string {
  if (arguments.length > 0) {
    if (typeof id !== 'number') throw new TypeError(`Spica: sqid: A parameter value must be a number: ${id}`);
    if (id >= 0 === false) throw new TypeError(`Spica: sqid: A parameter value must be a positive number: ${id}`);
    if (id % 1 !== 0) throw new TypeError(`Spica: sqid: A parameter value must be an integer: ${id}`);
  }
  return id === void 0
    ? (1e15 + ++cnt + '').slice(1)
    : (1e15 + id + '').slice(1);
}
