import { location } from './global';
import { NormalizedURL, ReadonlyURL } from './url/domain/format';

export { StandardURL, standardize } from './url/domain/format';
export { ReadonlyURL } from './url/domain/format';

export class URL<T extends string> {
  constructor(url: URL.Reference<T> | URL.Resource<T> | URL.Origin<T> | URL.Path<T> | URL.Pathname<T>, base?: string)
  constructor(url: URL.Reference<T> | URL.Resource<T> | URL.Origin<T> | URL.Path<T> | URL.Pathname<T> | URL.Query<T> | URL.Fragment<T>, base: T)
  constructor(url: URLSegment<string> & T, base: T)
  constructor(url: T, base?: T extends NormalizedURL ? string : T)
  constructor(url: string, base: string = location.href) {
    this.url = new ReadonlyURL(url, base);
    assert(this.url.href.endsWith(`${this.port}${this.path}${this.fragment}`));
    assert(this.reference === this.url.href);
    assert(this.reference.startsWith(this.resource));
    assert(this.origin === this.url.origin);
    assert(this.protocol === this.url.protocol);
    assert(this.host === this.url.host);
    assert(this.hostname === this.url.hostname);
    assert(this.port === this.url.port);
  }
  private readonly url: ReadonlyURL;
  public get reference(): URL.Reference<T> {
    return this.url.href as any;
  }
  private resource_!: URL.Resource<T>;
  public get resource(): URL.Resource<T> {
    return this.resource_ = this.resource_ === void 0
      ? this.reference.slice(
          0,
          this.query === '?'
            ? this.fragment ? -this.fragment.length - 1 : -1
            : -this.fragment.length || this.reference.length) as any
      : this.resource_;
  }
  public get origin(): URL.Origin<T> {
    return this.url.origin as any;
  }
  public get scheme(): URL.Scheme {
    return this.url.protocol.slice(0, -1) as any;
  }
  public get protocol(): URL.Protocol {
    return this.reference.slice(0, this.reference.indexOf(':') + 1) as any;
  }
  public get host(): URL.Host {
    return this.url.host as any;
  }
  public get hostname(): URL.Hostname {
    return this.url.hostname as any;
  }
  public get port(): URL.Port {
    return this.url.port as any;
  }
  private path_!: URL.Path<T>;
  public get path(): URL.Path<T> {
    return this.path_ = this.path_ ?? `${this.pathname}${this.query}` as any;
  }
  public get pathname(): URL.Pathname<T> {
    return this.url.pathname as any;
  }
  private query_!: URL.Query<T>;
  public get query(): URL.Query<T> {
    return this.query_ = this.query_ === void 0
      ? this.reference
          .slice(
            ~(~this.reference.slice(0, -this.fragment.length || this.reference.length).indexOf('?') || ~this.reference.length),
            -this.fragment.length || this.reference.length) as any
      : this.query_;
  }
  private fragment_!: URL.Fragment<T>;
  public get fragment(): URL.Fragment<T> {
    return this.fragment_ = this.fragment_ === void 0
      ? this.reference.slice((~(~this.reference.indexOf('#') || ~this.reference.length))) as any
      : this.fragment_;
  }
}
export namespace URL {
  export type Reference<T extends string> = URLSegment<'reference'> & T;
  export type Resource<T extends string> = URLSegment<'resource'> & T;
  export type Origin<T extends string> = URLSegment<'origin'> & T;
  export type Scheme = URLSegment<'scheme'> & string;
  export type Protocol = URLSegment<'protocol'> & string;
  export type Host = URLSegment<'host'> & string;
  export type Hostname = URLSegment<'hostname'> & string;
  export type Port = URLSegment<'port'> & string;
  export type Path<T extends string> = URLSegment<'path'> & T;
  export type Pathname<T extends string> = URLSegment<'pathname'> & T;
  export type Query<T extends string> = URLSegment<'query'> & T;
  export type Fragment<T extends string> = URLSegment<'fragment'> & T;
}

declare class URLSegment<T extends string> {
  private readonly URL: T;
}
