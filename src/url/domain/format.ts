import { Encoded } from '../attribute/encode';
import { Normalized } from '../attribute/normalize';
import { memoize } from '../../memoization';
import { Cache } from '../../cache';
import { flip } from '../../flip';
import { uncurry } from '../../uncurry';

const location = { get href() { return global['location'] && global['location'].href; } };

namespace Identifier {
  declare class Identity<T> {
    private static readonly IDENTITY: unique symbol;
    private readonly [Identity.IDENTITY]: T;
  }

  export type URL<T> = Identity<T> & string;
}

type URL<T> = Identifier.URL<T>;


// https://www.ietf.org/rfc/rfc3986.txt

export type StandardURL = URL<Encoded & Normalized>;

export function standardize(url: URL<unknown>, base?: string): void
export function standardize(url: string, base?: string): StandardURL
export function standardize(url: string, base: string = location.href): StandardURL {
  return encode(normalize(url, base));
}


type EncodedURL<T = Encoded> = URL<Encoded & T>;

function encode(url: EncodedURL): void
function encode<T>(url: URL<T>): EncodedURL<T>
function encode(url: string): EncodedURL
function encode(url: string): EncodedURL {
  return url
    // Trim
    .trim()
    // Percent-encoding
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]?|[\uDC00-\uDFFF]/g, str =>
      str.length === 2
        ? str
        : '')
    .replace(/%(?![0-9A-F]{2})|[^%\[\]]+/ig, encodeURI)
    .replace(/\?[^#]+/, query =>
      '?' +
      query.slice(1)
        .replace(/%[0-9A-F]{2}|[^=&]/ig, str =>
          str.length < 3
            ? encodeURIComponent(str)
            : str))
    // Use uppercase letters within percent-encoding triplets
    .replace(/%[0-9A-F]{2}/ig, str => str.toUpperCase())
    .replace(/#.+/, url.slice(url.indexOf('#')).trim()) as EncodedURL;
}
export { encode as _encode }


type NormalizedURL = URL<Normalized>;

function normalize(url: URL<unknown>, base: string): void
function normalize(url: string, base: string): NormalizedURL
function normalize(url: string, base: string): NormalizedURL {
  return newURL(url, base).href as NormalizedURL;
}

export const newURL: (url: string, base: string) => Readonly<global.URL> = flip(uncurry(memoize((base: string) => memoize((url: string) => new global.URL(formatURLForEdge(url, base), base), new Cache(9)), new Cache(9))));

function formatURLForEdge(url: string, base: string = location.href): string {
  return url.trim() || base;
}
