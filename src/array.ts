export function indexOf<a>(as: readonly a[], a: a): number {
  const isNaN = a !== a;
  for (let i = 0; i < as.length; ++i) {
    const ai = as[i];
    if (isNaN ? ai !== ai : ai === a) return i;
  }
  return -1;
}
