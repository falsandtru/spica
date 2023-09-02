import '../global';
import { Mutable } from '../type';
import { memoize } from '../memoize';
import { Cache } from '../cache';

declare class Absolute {
  private static readonly IDENTITY: unique symbol;
  private readonly [Absolute.IDENTITY];
}

declare class Encoded {
  private static readonly IDENTITY: unique symbol;
  private readonly [Encoded.IDENTITY];
}

declare class Identity<T> {
  private static readonly IDENTITY: unique symbol;
  private readonly [Identity.IDENTITY]: T;
}

type URL<T> = Identity<T> & string;


// https://www.ietf.org/rfc/rfc3986.txt

export type StandardURL = URL<Encoded & Absolute>;
export type AbsoluteURL = URL<Absolute>;

export function standardize(url: URL<unknown>, base?: string): void
export function standardize(url: string, base?: string): StandardURL
export function standardize(url: string, base?: string): StandardURL {
  const { origin, protocol, href } = new ReadonlyURL(url, base!);
  url = origin === 'null'
    ? protocol.toLowerCase() + href.slice(protocol.length)
    : origin.toLowerCase() + href.slice(origin.length);
  return encode(url as AbsoluteURL);
}


type EncodedURL<T = Encoded> = URL<Encoded & T>;

function encode(url: EncodedURL): void
function encode<T>(url: URL<T>): EncodedURL<T>
function encode(url: string): EncodedURL
function encode(url: string): EncodedURL {
  assert(url === url.trim());
  url = url.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '');
  const { 1: base, 2: hash } = url
    .match(/^([^#]*)(.*)$/s)!;
  const { 1: path, 2: query } = base
    .replace(/(?:%(?:[0-9][a-f]|[a-f][0-9a-fA-F]|[A-F][0-9a-f]))+/g, str => str.toUpperCase())
    .match(/^([^?]*)(.*)$/s)!;
  return ''
    + path.replace(/(?:[^%[\]]|%(?![0-9A-F]{2}))+/ig, encodeURI)
    + query.replace(/(?!^)(?:[^%=&]|%(?![0-9A-F]{2}))+/ig, encodeURIComponent)
    + hash as EncodedURL;
}
export { encode as _encode }


type CachedURL<T extends string> = Partial<Mutable<global.URL>> & {
  url: global.URL;
  href?: T;
  resource?: string;
  path?: string;
  query?: string;
  fragment?: string;
};
export class ReadonlyURL<T extends string = string> implements Readonly<global.URL> {
  // Can't freeze URL object in the Firefox extension environment.
  // ref: https://github.com/falsandtru/pjax-api/issues/44#issuecomment-633915035
  // Bug: Error in dependents.
  // @ts-ignore
  private static readonly get = memoize((url: string, base: string | undefined): CachedURL =>
    ({ url: new global.URL(url, base) }),
    (url, base = '') => `${base.indexOf('\n') > -1 ? base.replace(/\n+/g, '') : base}\n${url}`,
    new Cache(10000));
  constructor(url: T, ...base:
    T extends AbsoluteURL | `${string}:${string}` ? [string?] :
    T extends `${infer _}` ? [string] :
    [T]);
  constructor(source: string, base?: string) {
    source = source.trim();
    base = base?.trim();
    switch (source.slice(0, source.lastIndexOf('://', 9) + 1).toLowerCase()) {
      case 'http:':
      case 'https:':
        base = undefined;
        break;
      default:
        switch (base?.slice(0, base.lastIndexOf('://', 9) + 1).toLowerCase()) {
          case 'http:':
          case 'https:':
            const i = base.indexOf('#');
            if (i > -1) {
              base = base.slice(0, i);
            }
            const j = base.indexOf('?');
            if (j > -1 && source !== '' && source[0] !== '#') {
              base = base.slice(0, j);
            }
        }
    }
    this.cache = ReadonlyURL.get(source, base);
    this.source = source;
    this.base = base;
  }
  private readonly cache: CachedURL<T>;
  public readonly source: string;
  public readonly base?: string;
  public get href(): T {
    return this.cache.href
       ??= this.cache.url.href as T;
  }
  public get resource(): string {
    return this.cache.resource
       ??= this.href.slice(0, -this.fragment.length - this.query.length || this.href.length) + this.search;
  }
  public get origin(): string {
    return this.cache.origin
       ??= this.cache.url.origin;
  }
  public get protocol(): string {
    return this.cache.protocol
       ??= this.cache.url.protocol;
  }
  public get username(): string {
    return this.cache.username
       ??= this.cache.url.username;
  }
  public get password(): string {
    return this.cache.password
       ??= this.cache.url.password;
  }
  public get host(): string {
    return this.cache.host
       ??= this.cache.url.host;
  }
  public get hostname(): string {
    return this.cache.hostname
       ??= this.cache.url.hostname;
  }
  public get port(): string {
    return this.cache.port
       ??= this.cache.url.port;
  }
  public get path(): string {
    return this.cache.path
       ??= `${this.pathname}${this.search}`;
  }
  public get pathname(): string {
    return this.cache.pathname
       ??= this.cache.url.pathname;
  }
  public get search(): string {
    return this.cache.search
       ??= this.cache.url.search;
  }
  public get query(): string {
    return this.cache.query
       ??= this.search || this.href[this.href.length - this.fragment.length - 1] === '?' && '?' || '';
  }
  public get hash(): string {
    return this.cache.hash
       ??= this.cache.url.hash;
  }
  public get fragment(): string {
    return this.cache.fragment
       ??= this.hash || this.href[this.href.length - 1] === '#' && '#' || '';
  }
  public get searchParams(): URLSearchParams {
    return new URLSearchParams(this.search);
  }
  public toString(): string {
    return this.href;
  }
  public toJSON(): string {
    return this.href;
  }
}
