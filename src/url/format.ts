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
  const u = new ReadonlyURL(url, base!);
  url = u.origin === 'null'
    ? u.protocol.toLowerCase() + u.href.slice(u.protocol.length)
    : u.origin.toLowerCase() + u.href.slice(u.origin.length);
  return encode(url as AbsoluteURL);
}


type EncodedURL<T = Encoded> = URL<Encoded & T>;

function encode(url: EncodedURL): void
function encode<T>(url: URL<T>): EncodedURL<T>
function encode(url: string): EncodedURL
function encode(url: string): EncodedURL {
  assert(url === url.trim());
  return url
    // Percent-encoding
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]?|[\uDC00-\uDFFF]/g, str =>
      str.length === 2
        ? str
        : '')
    .replace(/%(?![0-9A-F]{2})|[^%\[\]]+/ig, encodeURI)
    .replace(/\?[^#]+/, query =>
      '?' +
      query.slice(1)
        .replace(/%[0-9A-F]{2}|%|[^=&]+/ig, str =>
          str[0] === '%' && str.length === 3
            ? str
            : encodeURIComponent(str)))
    // Use uppercase letters within percent-encoding triplets
    .replace(/%[0-9A-F]{2}/ig, str => str.toUpperCase())
    .replace(/#.+/, url.slice(url.indexOf('#'))) as EncodedURL;
}
export { encode as _encode }


type SharedURL = Partial<Mutable<global.URL>> & {
  url: global.URL;
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
  private static readonly get = memoize((url: string, base: string | undefined): SharedURL =>
    ({ url: new global.URL(url, base) }),
    (url, base = '') => `${base.indexOf('\n') > -1 ? base.replace(/\n+/g, '') : base}\n${url}`,
    new Cache(10000));
  constructor(url: T, ...base:
    T extends AbsoluteURL | `${string}:${string}` ? [string?] :
    T extends `${infer _}` ? [string] :
    [T]);
  constructor(
    public readonly source: string,
    public readonly base?: string,
  ) {
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
            if (i > -1 && source.indexOf('#') === -1) {
              base = base.slice(0, j);
            }
        }
    }
    this.share = ReadonlyURL.get(source, base);
  }
  private readonly share: SharedURL;
  private params: URLSearchParams | undefined;
  public get href(): T {
    return (this.share.href as T)
       ??= this.share.url.href as T;
  }
  public get resource(): string {
    return this.share.resource
       ??= this.href.slice(0, -this.fragment.length - this.query.length || this.href.length) + this.search;
  }
  public get origin(): string {
    return this.share.origin
       ??= this.share.url.origin;
  }
  public get protocol(): string {
    return this.share.protocol
       ??= this.share.url.protocol;
  }
  public get username(): string {
    return this.share.username
       ??= this.share.url.username;
  }
  public get password(): string {
    return this.share.password
       ??= this.share.url.password;
  }
  public get host(): string {
    return this.share.host
       ??= this.share.url.host;
  }
  public get hostname(): string {
    return this.share.hostname
       ??= this.share.url.hostname;
  }
  public get port(): string {
    return this.share.port
       ??= this.share.url.port;
  }
  public get path(): string {
    return this.share.path
       ??= `${this.pathname}${this.search}`;
  }
  public get pathname(): string {
    return this.share.pathname
       ??= this.share.url.pathname;
  }
  public get search(): string {
    return this.share.search
       ??= this.share.url.search;
  }
  public get query(): string {
    return this.share.query
       ??= this.search || this.href[this.href.length - this.fragment.length - 1] === '?' && '?' || '';
  }
  public get hash(): string {
    return this.share.hash
       ??= this.share.url.hash;
  }
  public get fragment(): string {
    return this.share.fragment
       ??= this.hash || this.href[this.href.length - 1] === '#' && '#' || '';
  }
  public get searchParams(): URLSearchParams {
    return this.params
       ??= new URLSearchParams(this.search);
  }
  public toString(): string {
    return this.href;
  }
  public toJSON(): string {
    return this.href;
  }
}
