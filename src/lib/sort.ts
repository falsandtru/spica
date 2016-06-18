export function sort<T>(as: T[], cmp: (a: T, b: T) => number, times: number, debug = false): T[] {
  if (!debug && times * times > as.length * 1.25) return as.sort(cmp);
  times = times < as.length - 1 ? times : as.length - 1;
  for (let i = 0; i < times; ++i) {
    for (let j = i + 1; j < as.length; ++j) {
      if (cmp(as[i], as[j]) > 0 === false) continue;
      const a = as[i];
      as[i] = as[j];
      as[j] = a;
    }
  }
  return as;
}
