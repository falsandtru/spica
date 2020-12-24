import { Array } from './global';
import { noop } from './noop';

export function mapParameters<as extends unknown[], bs extends readonly unknown[], c>(f: (...b: bs) => c, g: (...as: as) => bs): (...as: as) => c {
  return (...as) => f(...g(...as));
}

export function mapReturn<as extends unknown[], b, c>(f: (...as: as) => b, g: (b: b) => c): (...as: as) => c {
  return (...as) => g(f(...as));
}

export function clear<as extends unknown[]>(f: (...as: as) => void): (...as: as) => undefined {
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
  const gs = Array<() => void>(fs.length);
  try {
    for (let i = 0; i < fs.length; ++i) {
      gs[i] = fs[i]();
    }
  }
  catch (reason) {
    for (let i = 0; gs[i]; ++i) {
      gs[i]();
    }
    throw reason;
  }
  // @ts-ignore
  return once(() => {
    for (let i = 0; gs[i]; ++i) {
      gs[i]();
    }
  });
}
