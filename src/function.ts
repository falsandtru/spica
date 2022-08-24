export function singleton<f extends (...args: unknown[]) => unknown>(f: f): f {
  let result: [unknown];
  return function (this: unknown, ...as) {
    if (result) return result[0];
    result = [f.call(this, ...as)];
    return result[0];
  } as f;
}

export function clear<as extends unknown[]>(f: (...as: as) => void): (...as: as) => undefined {
  return (...as) => void f(...as);
}

export function id<a>(a: a): a {
  return a;
}

export function fix<a>(f: (a: a) => a): (a: a) => a {
  return a1 => {
    const a2 = f(a1);
    return a1 === a2
        || a2 !== a2
      ? a2
      : f(a2);
  };
}

// @ts-ignore
export function noop(): undefined {
}
