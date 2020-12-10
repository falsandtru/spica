import { undefined, location } from './global';
import { NormalizedURL, ReadonlyURL } from './url/domain/format';

export { StandardURL, standardize } from './url/domain/format';
export { ReadonlyURL } from './url/domain/format';

const internal = Symbol.for('spica/url::internal');

export class URL<T extends string> {
  constructor(url: URL.Reference<T> | URL.Resource<T> | URL.Origin<T> | URL.Path<T> | URL.Pathname<T>, base?: string)
  constructor(url: URL.Reference<T> | URL.Resource<T> | URL.Origin<T> | URL.Path<T> | URL.Pathname<T> | URL.Query<T> | URL.Fragment<T>, base: T)
  constructor(url: URLSegment<string> & T, base: T)
  constructor(url: T, base?: T extends NormalizedURL ? string : T)
  constructor(url: string, base: string = location.href) {
    this[internal].url = new ReadonlyURL(url, base);
    assert(this[internal].url!.href.endsWith(`${this.port}${this.path}${this.fragment}`));
    assert(this.reference === this[internal].url!.href);
    assert(this.reference.startsWith(this.resource));
    assert(this.origin === this[internal].url!.origin);
    assert(this.protocol === this[internal].url!.protocol);
    assert(this.host === this[internal].url!.host);
    assert(this.hostname === this[internal].url!.hostname);
    assert(this.port === this[internal].url!.port);
  }
  private readonly [internal]: Partial<{
    url: ReadonlyURL;
    resource: URL.Resource<T>;
    path: URL.Path<T>;
    query: URL.Query<T>;
    fragment: URL.Fragment<T>;
  }> = {
    url: undefined,
    resource: undefined,
    path: undefined,
    query: undefined,
    fragment: undefined,
  };
  public get reference(): URL.Reference<T> {
    return this[internal].url!.href as any;
  }
  public get resource(): URL.Resource<T> {
    return this[internal].resource === undefined
      ? this[internal].resource = this.reference
          .slice(
            0,
            this.query === '?'
              ? -this.fragment.length - 1
              : -this.fragment.length || this.reference.length) as any
      : this[internal].resource;
  }
  public get origin(): URL.Origin<T> {
    return this[internal].url!.origin as any;
  }
  public get scheme(): URL.Scheme {
    return this[internal].url!.protocol.slice(0, -1) as any;
  }
  public get protocol(): URL.Protocol {
    return this[internal].url!.protocol as any;
  }
  public get host(): URL.Host {
    return this[internal].url!.host as any;
  }
  public get hostname(): URL.Hostname {
    return this[internal].url!.hostname as any;
  }
  public get port(): URL.Port {
    return this[internal].url!.port as any;
  }
  public get path(): URL.Path<T> {
    return this[internal].path === undefined
      ? this[internal].path = `${this.pathname}${this.query}` as any
      : this[internal].path;
  }
  public get pathname(): URL.Pathname<T> {
    return this[internal].url!.pathname as any;
  }
  public get query(): URL.Query<T> {
    return this[internal].query === undefined
      ? this[internal].query = this.reference
          .slice(
            ~(~this.reference.slice(0, -this.fragment.length || this.reference.length).indexOf('?') || ~this.reference.length),
            -this.fragment.length || this.reference.length) as any
      : this[internal].query;
  }
  public get fragment(): URL.Fragment<T> {
    return this[internal].fragment === undefined
      ? this[internal].fragment = this.reference
          .slice(~(~this.reference.indexOf('#') || ~this.reference.length)) as any
      : this[internal].fragment;
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
