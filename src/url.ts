import { NormalizedURL, ReadonlyURL } from './url/domain/format';

export { StandardURL, standardize } from './url/domain/format';
export { ReadonlyURL } from './url/domain/format';

type Protocol
  = 'http://'
  | 'https://'
  | 'blob:'
  | 'data:'
  | 'mailto:'
  | 'tel:';

const internal = Symbol.for('spica/url::internal');

export class URL<T extends string> {
  constructor(url: T, ...base:
    T extends URL.Reference<T> | URL.Resource<T> | URL.Origin<T> | `${Protocol}${infer _}` ? [string?] :
    T extends URLSegment<infer U> ? [URL.Reference<U> | URL.Resource<U> | URL.Origin<U>] :
    T extends NormalizedURL ? [string?] :
    string extends T ? [T] : [string])
  constructor(
    public readonly url: string,
    public readonly base?: string,
  ) {
    this[internal] = new ReadonlyURL(url, base);
    //assert(this[internal].url!.href.endsWith(`${this.port}${this.path}${this.fragment}`));
    assert(this.reference === this[internal].href);
    //assert(this.reference.startsWith(this.resource));
    assert(this.origin === this[internal].origin);
    assert(this.protocol === this[internal].protocol);
    assert(this.host === this[internal].host);
    assert(this.hostname === this[internal].hostname);
    assert(this.port === this[internal].port);
  }
  private readonly [internal]: ReadonlyURL;
  public get reference(): URL.Reference<T> {
    return this[internal].href as any;
  }
  public get resource(): URL.Resource<T> {
    return this[internal].resource as any;
  }
  public get origin(): URL.Origin<T> {
    return this[internal].origin as any;
  }
  public get scheme(): URL.Scheme {
    return this[internal].protocol.slice(0, -1) as any;
  }
  public get protocol(): URL.Protocol {
    return this[internal].protocol as any;
  }
  public get host(): URL.Host {
    return this[internal].host as any;
  }
  public get hostname(): URL.Hostname {
    return this[internal].hostname as any;
  }
  public get port(): URL.Port {
    return this[internal].port as any;
  }
  public get path(): URL.Path<T> {
    return this[internal].path as any;
  }
  public get pathname(): URL.Pathname<T> {
    return this[internal].pathname as any;
  }
  public get seach(): URL.Search<T> {
    return this[internal].search as any;
  }
  public get query(): URL.Query<T> {
    return this[internal].query as any;
  }
  public get hash(): URL.Hash<T> {
    return this[internal].hash as any;
  }
  public get fragment(): URL.Fragment<T> {
    return this[internal].fragment as any;
  }
  public get params(): URLSearchParams {
    return this[internal].searchParams;
  }
  public toString(): string {
    return this.reference;
  }
  public toJSON(): string {
    return this.reference;
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
  export type Search<T extends string> = URLSegment<'search'> & T;
  export type Query<T extends string> = URLSegment<'query'> & T;
  export type Hash<T extends string> = URLSegment<'hash'> & T;
  export type Fragment<T extends string> = URLSegment<'fragment'> & T;
}

declare class URLSegment<T extends string> {
  private readonly URL: T;
}
