import { global, location } from './global';
import { StandardURL, newURL } from './url/domain/format';

export { StandardURL, standardize } from './url/domain/format';

export class URL<T extends string> {
  constructor(url: URL.Reference<T> | URL.Resource<T> | URL.Origin<T> | URL.Path<T> | URL.Pathname<T>, base?: string)
  constructor(url: URL.Reference<T> | URL.Resource<T> | URL.Origin<T> | URL.Path<T> | URL.Pathname<T> | URL.Query<T> | URL.Fragment<T>, base: T)
  constructor(url: URLSegment<string> & T, base: T)
  constructor(url: T, base?: T extends StandardURL ? string : T)
  constructor(url: string, base: string = location.href) {
    this.url = newURL(url, base);
    assert(this.url.href.startsWith(this.url.protocol));
  }
  private readonly url: global.URL;
  private reference_!: URL.Reference<T>;
  public get reference(): URL.Reference<T> {
    return this.reference_ = this.reference_ ?? this.url.href as any;
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
  private origin_!: URL.Origin<T>;
  public get origin(): URL.Origin<T> {
    return this.origin_ = this.origin_ ?? this.url.origin as any;
  }
  private scheme_!: URL.Scheme;
  public get scheme(): URL.Scheme {
    return this.scheme_ = this.scheme_ ?? this.url.protocol.slice(0, -1) as any;
  }
  private protocol_!: URL.Protocol;
  public get protocol(): URL.Protocol {
    return this.protocol_ = this.protocol_
        ?? this.reference.slice(0, this.reference.indexOf(':') + 1) as any;
  }
  private host_!: URL.Host;
  public get host(): URL.Host {
    return this.host_ = this.host_ ?? this.url.host as any;
  }
  private hostname_!: URL.Hostname;
  public get hostname(): URL.Hostname {
    return this.hostname_ = this.hostname_ === void 0
      ? this.host.slice(0, ((this.host.indexOf(':') + 1 || this.host.length + 1) - 1)) as any
      : this.hostname_;
  }
  private port_!: URL.Port;
  public get port(): URL.Port {
    return this.port_ = this.port_ === void 0
      ? this.host.slice(((this.host.indexOf(':') + 1 || this.host.length + 1))) as any
      : this.port_;
  }
  private path_!: URL.Path<T>;
  public get path(): URL.Path<T> {
    return this.path_ = this.path_ ?? `${this.pathname}${this.query}` as any;
  }
  private pathname_!: URL.Pathname<T>;
  public get pathname(): URL.Pathname<T> {
    return this.pathname_ = this.pathname_ ?? this.url.pathname as any;
  }
  private query_!: URL.Query<T>;
  public get query(): URL.Query<T> {
    return this.query_ = this.query_ === void 0
      ? this.reference
          .slice(
            (this.reference.slice(0, -this.fragment.length || this.reference.length).indexOf('?') + 1 || this.reference.length + 1) - 1,
            -this.fragment.length || this.reference.length) as any
      : this.query_;
  }
  private fragment_!: URL.Fragment<T>;
  public get fragment(): URL.Fragment<T> {
    return this.fragment_ = this.fragment_ === void 0
      ? this.reference.slice(((this.reference.indexOf('#') + 1 || this.reference.length + 1) - 1)) as any
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
