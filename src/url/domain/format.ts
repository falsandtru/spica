import { global, undefined, location } from '../../global';
import { Mutable } from '../../type';
import { ObjectFreeze } from '../../alias';
import { Encoded } from '../attribute/encode';
import { Normalized } from '../attribute/normalize';
import { memoize } from '../../memoize';
import { Cache } from '../../cache';
import { flip } from '../../flip';
import { uncurry } from '../../curry';

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


export type NormalizedURL = URL<Normalized>;

function normalize(url: URL<unknown>, base: string): void
function normalize(url: string, base: string): NormalizedURL
function normalize(url: string, base: string): NormalizedURL {
  return new ReadonlyURL(url, base).href as NormalizedURL;
}

export interface ReadonlyURL extends Readonly<global.URL> {
}
export class ReadonlyURL {
  // Can't freeze URL object in the Firefox extension environment.
  // ref: https://github.com/falsandtru/pjax-api/issues/44#issuecomment-633915035
  private static readonly freezable = (() => {
    try {
      ObjectFreeze(new global.URL(location.href));
      return true;
    }
    catch {
      return false;
    }
  })();
  private static readonly new: (url: string, base: string | undefined) => global.URL = flip(uncurry(memoize((base: string | undefined) => memoize((url: string) => new global.URL(formatURLForEdge(url, base), base), new Cache(100)), new Cache(100))));
  constructor(url: string, base?: string) {
    this._cache.url = ReadonlyURL.freezable
      ? ObjectFreeze(ReadonlyURL.new(url, base))
      : ReadonlyURL.new(url, base);
  }
  private _cache: Partial<Mutable<global.URL>> & {
    url: global.URL;
  } = {} as any;
  public get href(): string {
    return this._cache.href === undefined
      ? this._cache.href = this._cache.url.href
      : this._cache.href;
  }
  public get origin(): string {
    return this._cache.origin === undefined
      ? this._cache.origin = this._cache.url.origin
      : this._cache.origin;
  }
  public get protocol(): string {
    return this._cache.protocol === undefined
      ? this._cache.protocol = this._cache.url.protocol
      : this._cache.protocol;
  }
  public get username(): string {
    return this._cache.username === undefined
      ? this._cache.username = this._cache.url.username
      : this._cache.username;
  }
  public get password(): string {
    return this._cache.password === undefined
      ? this._cache.password = this._cache.url.password
      : this._cache.password;
  }
  public get host(): string {
    return this._cache.host === undefined
      ? this._cache.host = this._cache.url.host
      : this._cache.host;
  }
  public get hostname(): string {
    return this._cache.hostname === undefined
      ? this._cache.hostname = this._cache.url.hostname
      : this._cache.hostname;
  }
  public get port(): string {
    return this._cache.port === undefined
      ? this._cache.port = this._cache.url.port
      : this._cache.port;
  }
  public get pathname(): string {
    return this._cache.pathname === undefined
      ? this._cache.pathname = this._cache.url.pathname
      : this._cache.pathname;
  }
  public get search(): string {
    return this._cache.search === undefined
      ? this._cache.search = this._cache.url.search
      : this._cache.search;
  }
  public get hash(): string {
    return this._cache.hash === undefined
      ? this._cache.hash = this._cache.url.hash
      : this._cache.hash;
  }
  public get searchParams(): URLSearchParams {
    return this._cache.searchParams === undefined
      ? this._cache.searchParams = this._cache.url.searchParams
      : this._cache.searchParams;
  }
  public toString(): string {
    return this.href;
  }
  public toJSON(): string {
    return this.href;
  }
}

function formatURLForEdge(url: string, base: string | undefined): string {
  return url.trim() || base || '';
}
