import { Array } from './global';
import { causeAsyncException } from './exception';
import { noop } from './noop';

export function singleton<f extends (..._: unknown[]) => unknown>(f: f): f {
  let result: unknown;
  return function (this: unknown, ...as) {
    if (f === noop) return result;
    result = f.call(this, ...as);
    f = noop as f;
    return result;
  } as f;
}

export function mapParameters<as extends unknown[], bs extends readonly unknown[], c>(f: (...b: bs) => c, g: (...as: as) => bs): (...as: as) => c {
  return (...as) => f(...g(...as));
}

export function mapReturn<as extends unknown[], b, c>(f: (...as: as) => b, g: (b: b) => c): (...as: as) => c {
  return (...as) => g(f(...as));
}

export function clear<as extends unknown[]>(f: (...as: as) => void): (...as: as) => undefined {
  return (...as) => void f(...as);
}

export function run(fs: readonly (() => () => void)[]): () => undefined {
  const gs = Array<() => void>(fs.length);
  try {
    for (let i = 0; i < fs.length; ++i) {
      gs[i] = fs[i]();
    }
  }
  catch (reason) {
    // TODO: Use AggregateError and cause option.
    for (let i = 0; gs[i]; ++i) {
      try {
        gs[i]();
      } catch (reason) {
        causeAsyncException(reason);
      }
    }
    throw reason;
  }
  // @ts-ignore
  return singleton(() => {
    const rs = [];
    for (let i = 0; gs[i]; ++i) {
      try {
        gs[i]();
      } catch (reason) {
        rs.push(reason);
      }
    }
    if (rs.length > 0) {
      throw new AggregateError(rs);
    }
  });
}
