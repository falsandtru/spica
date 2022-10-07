export function sum(values: readonly number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

export function average(values: readonly number[]): number {
  return sum(values) / values.length;
}

export function distribution(values: readonly number[]): number {
  const avg = average(values);
  return values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length;
}

export function deviation(values: readonly number[]): number {
  return Math.sqrt(distribution(values));
}
