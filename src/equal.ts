export function findIndex<a>(a1: a, as: a[]): number {
  const isNaN = a1 !== a1;
  for (let i = 0; i < as.length; ++i) {
    const a2 = as[i];
    if (isNaN ? a2 !== a2 : a2 === a1) return i;
  }
  return -1;
}
