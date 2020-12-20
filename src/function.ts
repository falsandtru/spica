import { noop } from './noop';

export function mapParameters<as extends unknown[], bs extends readonly unknown[], c>(f: (...b: bs) => c, g: (...as: as) => bs): (...as: as) => c {
  return (...as) => f(...g(...as));
}

export function mapReturn<as extends unknown[], b, c>(f: (...as: as) => b, g: (b: b) => c): (...as: as) => c {
  return (...as) => g(f(...as));
}

export function clear<as extends unknown[], b>(f: (...as: as) => b): (...as: as) => undefined {
  return (...as) => void f(...as);
}

export function once<f extends (..._: unknown[]) => undefined>(f: f): f {
  return ((...as) => {
    if (f === noop) return;
    f(...as);
    f = noop as f;
    as = [];
  }) as f;
}

export function run(fs: readonly (() => () => void)[]): () => undefined {
  const gs: (() => void)[] = [];
  try {
    for (let i = 0; i < fs.length; ++i) {
      gs.push(fs[i]());
    }
  }
  catch (reason) {
    for (let i = 0; i < gs.length; ++i) {
      gs[i]();
    }
    throw reason;
  }
  // @ts-ignore
  return () => {
    for (let i = 0; i < gs.length; ++i) {
      gs[i]();
    }
  };
}
