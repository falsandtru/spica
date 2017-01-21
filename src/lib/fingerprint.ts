import { Sequence, nat } from './monad/sequence';

export const FINGERPRINT = typeof window === 'object' ? browser() : server();

declare const window: {
  navigator: {};
  screen: {};
};
function browser(): number {
  return hash(str2digit([
    stringify(Object.getOwnPropertyNames(window)),
    stringify(window.navigator),
    stringify(window.screen),
    stringify(new Date().getTimezoneOffset())
  ].join()));
}

declare const process: {};
function server(): number {
  return hash(str2digit([
    stringify(process)
  ].join()));
}

function hash(digit: string): number {
  return digit.split('')
    .reduce((a, b) => (+b + a + a / 1e9 | 0) * 9 % 1e9, 0);
}

function str2digit(str: string): string {
  return str.split('')
    .reduce((s, c) => s + c.charCodeAt(0), '')
}

function stringify(obj: {}, depth: number = 5): string {
  return obj instanceof Object
      && depth > 0
    ? `{${
        Sequence.union(
          nat
            .take(1)
            .bind(() => {
              const ks: string[] = [];
              for (const k in obj) {
                void ks.push(k);
              }
              return Sequence.from(ks);
            }),
          Sequence.from(Object.getOwnPropertyNames(obj)),
          (l, r) =>
            l === r
              ? 0
              : l < r
                ? -1
                : 1)
          .map(k =>
            `"${k}": ${stringify(obj[k], depth - 1)}`)
          .extract()
          .join()
      }}`
    : !obj || obj.toString
        ? `"${obj}"`
        : `"${Object.prototype.toString.call(obj)}"`;
}
