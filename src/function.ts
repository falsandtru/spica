export function singleton<f extends (...args: unknown[]) => unknown>(f: f): f {
  let result: unknown;
  assert(result === noop());
  return function (this: unknown, ...as) {
    if (f === noop) return result;
    result = f.call(this, ...as);
    f = noop as f;
    return result;
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
