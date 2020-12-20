import { undefined } from './global';

export function mapParameters<as extends unknown[], bs extends readonly unknown[], c>(f: (...b: bs) => c, g: (...as: as) => bs): (...as: as) => c {
  return (...as) => f(...g(...as));
}

export function mapReturn<as extends unknown[], b, c>(f: (...as: as) => b, g: (b: b) => c): (...as: as) => c {
  return (...as) => g(f(...as));
}

export function once<f extends (..._: unknown[]) => undefined>(f: f): f {
  return ((...as) => {
    if (!f) return;
    f(...as);
    // @ts-expect-error
    f = undefined;
    as = [];
  }) as f;
}
