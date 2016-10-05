declare const window: {
  navigator: {};
  screen: {};
};

export const FINGERPRINT = typeof window === 'object' ? browser() : server();

export function browser(): number {
  return hash(str2digit([
    stringify(window.navigator),
    stringify(window.screen),
    stringify(new Date().getTimezoneOffset())
  ].join()));
}

declare const process: {};
export function server(): number {
  return hash(str2digit([
    stringify(process)
  ].join()));
}

export function hash(digit: string): number {
  return digit.split('')
    .reduce((a, b, i) => (+b * i + a) % 1e9 || a - +b, 0);
}

export function str2digit(str: string): string {
  return str.split('')
    .map(c => c.charCodeAt(0))
    .join('');
}

export function stringify(obj: {}, depth: number = 5): string {
  if (depth > 0 && obj && typeof obj === 'object') {
    let str = '{';
    for (const p in obj) {
      str += `"${p}": ${stringify(obj[p], depth - 1)},`;
    }
    str += '}';
    return str;
  }
  else {
    return !obj || obj.toString
      ? `"${obj}"`
      : `"${Object.prototype.toString.call(obj)}"`;
  }
}
