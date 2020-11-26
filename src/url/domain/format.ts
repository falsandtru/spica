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

const internal = Symbol();

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
  private static readonly get: (url: string, base: string | undefined) => global.URL
    = flip(uncurry(memoize((base: string | undefined) => memoize((url: string) =>
        ReadonlyURL.freezable
          ? ObjectFreeze(new global.URL(formatURLForEdge(url, base), base))
          : new global.URL(formatURLForEdge(url, base), base)
      , new Cache(100)), new Cache(100))));
  constructor(url: string, base?: string) {
    this[internal].url = ReadonlyURL.get(url, base);
  }
  private readonly [internal]: Partial<Mutable<global.URL>> & {
    url: global.URL;
  } = {
    url: undefined as any,
    href: undefined,
    origin: undefined,
    protocol: undefined,
    username: undefined,
    password: undefined,
    host: undefined,
    hostname: undefined,
    port: undefined,
    pathname: undefined,
    search: undefined,
    hash: undefined,
    searchParams: undefined,
  };
  public get href(): string {
    return this[internal].href === undefined
      ? this[internal].href = this[internal].url.href
      : this[internal].href!;
  }
  public get origin(): string {
    return this[internal].origin === undefined
      ? this[internal].origin = this[internal].url.origin
      : this[internal].origin!;
  }
  public get protocol(): string {
    return this[internal].protocol === undefined
      ? this[internal].protocol = this[internal].url.protocol
      : this[internal].protocol!;
  }
  public get username(): string {
    return this[internal].username === undefined
      ? this[internal].username = this[internal].url.username
      : this[internal].username!;
  }
  public get password(): string {
    return this[internal].password === undefined
      ? this[internal].password = this[internal].url.password
      : this[internal].password!;
  }
  public get host(): string {
    return this[internal].host === undefined
      ? this[internal].host = this[internal].url.host
      : this[internal].host!;
  }
  public get hostname(): string {
    return this[internal].hostname === undefined
      ? this[internal].hostname = this[internal].url.hostname
      : this[internal].hostname!;
  }
  public get port(): string {
    return this[internal].port === undefined
      ? this[internal].port = this[internal].url.port
      : this[internal].port!;
  }
  public get pathname(): string {
    return this[internal].pathname === undefined
      ? this[internal].pathname = this[internal].url.pathname
      : this[internal].pathname!;
  }
  public get search(): string {
    return this[internal].search === undefined
      ? this[internal].search = this[internal].url.search
      : this[internal].search!;
  }
  public get hash(): string {
    return this[internal].hash === undefined
      ? this[internal].hash = this[internal].url.hash
      : this[internal].hash!;
  }
  public get searchParams(): URLSearchParams {
    return this[internal].searchParams === undefined
      ? this[internal].searchParams = this[internal].url.searchParams
      : this[internal].searchParams!;
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
