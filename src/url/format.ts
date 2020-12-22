import { global, undefined, encodeURI, encodeURIComponent, URLSearchParams } from '../global';
import { Mutable } from '../type';
import { memoize } from '../memoize';
import { Cache } from '../cache';
import { flip } from '../flip';
import { uncurry } from '../curry';

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
  const u = new ReadonlyURL(url, base);
  url = u.origin !== 'null'
    ? u.origin.toLowerCase() + u.href.slice(u.origin.length)
    : u.protocol.toLowerCase() + u.href.slice(u.protocol.length);
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


const internal = Symbol.for('spica/url::internal');

type SharedURL = Partial<Mutable<global.URL>> & {
  url: global.URL;
  resource?: string;
  path?: string;
  query?: string;
  fragment?: string;
};
export class ReadonlyURL implements Readonly<global.URL> {
  // Can't freeze URL object in the Firefox extension environment.
  // ref: https://github.com/falsandtru/pjax-api/issues/44#issuecomment-633915035
  private static readonly get: (url: string, base: string | undefined) => SharedURL
    = flip(uncurry(memoize((base: string | undefined) => memoize((url: string) =>
      ({
        url: new global.URL(url, base),
        href: undefined,
        resource: undefined,
        origin: undefined,
        protocol: undefined,
        username: undefined,
        password: undefined,
        host: undefined,
        hostname: undefined,
        port: undefined,
        path: undefined,
        pathname: undefined,
        search: undefined,
        query: undefined,
        hash: undefined,
        fragment: undefined,
      })
      , new Cache(100)), new Cache(100))));
  constructor(
    public readonly src: string,
    public readonly base?: string,
  ) {
    const i = base?.indexOf('#') ?? -1;
    if (i > -1) {
      base = base?.slice(0, i);
    }
    const j = base?.indexOf('?') ?? -1;
    if (i > -1 && src.indexOf('#') === -1) {
      base = base?.slice(0, j);
    }
    this[internal] = {
      share: ReadonlyURL.get(src, base),
      searchParams: undefined,
    };
  }
  private readonly [internal]: {
    share: SharedURL;
    searchParams?: URLSearchParams;
  };
  public get href(): string {
    return this[internal].share.href === undefined
      ? this[internal].share.href = this[internal].share.url.href
      : this[internal].share.href!;
  }
  public get resource(): string {
    return this[internal].share.resource === undefined
      ? this[internal].share.resource = this.href.slice(0, -this.fragment.length - this.query.length || this.href.length) + this.search
      : this[internal].share.resource!;
  }
  public get origin(): string {
    return this[internal].share.origin === undefined
      ? this[internal].share.origin = this[internal].share.url.origin
      : this[internal].share.origin!;
  }
  public get protocol(): string {
    return this[internal].share.protocol === undefined
      ? this[internal].share.protocol = this[internal].share.url.protocol
      : this[internal].share.protocol!;
  }
  public get username(): string {
    return this[internal].share.username === undefined
      ? this[internal].share.username = this[internal].share.url.username
      : this[internal].share.username!;
  }
  public get password(): string {
    return this[internal].share.password === undefined
      ? this[internal].share.password = this[internal].share.url.password
      : this[internal].share.password!;
  }
  public get host(): string {
    return this[internal].share.host === undefined
      ? this[internal].share.host = this[internal].share.url.host
      : this[internal].share.host!;
  }
  public get hostname(): string {
    return this[internal].share.hostname === undefined
      ? this[internal].share.hostname = this[internal].share.url.hostname
      : this[internal].share.hostname!;
  }
  public get port(): string {
    return this[internal].share.port === undefined
      ? this[internal].share.port = this[internal].share.url.port
      : this[internal].share.port!;
  }
  public get path(): string {
    return this[internal].share.path === undefined
      ? this[internal].share.path = `${this.pathname}${this.search}`
      : this[internal].share.path!;
  }
  public get pathname(): string {
    return this[internal].share.pathname === undefined
      ? this[internal].share.pathname = this[internal].share.url.pathname
      : this[internal].share.pathname!;
  }
  public get search(): string {
    return this[internal].share.search === undefined
      ? this[internal].share.search = this[internal].share.url.search
      : this[internal].share.search!;
  }
  public get query(): string {
    return this[internal].share.query === undefined
      ? this[internal].share.query = this.search || this.href[this.href.length - this.fragment.length - 1] === '?' && '?' || '' as any
      : this[internal].share.query;
  }
  public get hash(): string {
    return this[internal].share.hash === undefined
      ? this[internal].share.hash = this[internal].share.url.hash
      : this[internal].share.hash!;
  }
  public get fragment(): string {
    return this[internal].share.fragment === undefined
      ? this[internal].share.fragment = this.hash || this.href[this.href.length - 1] === '#' && '#' || ''
      : this[internal].share.fragment!;
  }
  public get searchParams(): URLSearchParams {
    return this[internal].searchParams === undefined
      ? this[internal].searchParams = new URLSearchParams(this.search)
      : this[internal].searchParams!;
  }
  public toString(): string {
    return this.href;
  }
  public toJSON(): string {
    return this.href;
  }
}
