import { AbsoluteURL, ReadonlyURL } from './url/format';

export { StandardURL, standardize } from './url/format';
export { ReadonlyURL } from './url/format';

type Protocol
  = 'http://'
  | 'https://'
  | 'blob:'
  | 'data:'
  | 'file:'
  | 'mailto:'
  | 'tel:';

type Fix<T> = T extends `${infer _}` ? string : T;

const internal = Symbol.for('spica/url::internal');

export class URL<T extends string> implements Readonly<global.URL> {
  constructor(url: T, ...base:
    T extends URL.Href<string> | URL.Resource<string> | URL.Origin<string> | `${Protocol}${infer _}` ? [string?] :
    T extends URLSegment<infer U> ? [U] :
    T extends AbsoluteURL ? [string?] :
    T extends `${infer _}` ? [string] : [T])
  constructor(
    public readonly url: string,
    public readonly base?: string,
  ) {
    this[internal] = new ReadonlyURL(url, base);
    assert(this[internal].href.endsWith(`${this.port}${this.pathname}${this.query}${this.fragment}`));
    assert(this.href === this[internal].href);
    //assert(this.href.startsWith(this.resource));
    assert(this.origin === this[internal].origin);
    assert(this.protocol === this[internal].protocol);
    assert(this.host === this[internal].host);
    assert(this.hostname === this[internal].hostname);
    assert(this.port === this[internal].port);
  }
  private readonly [internal]: ReadonlyURL;
  public get href(): URL.Href<T> {
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
  public get username(): URL.Username {
    return this[internal].username as any;
  }
  public get password(): URL.Password {
    return this[internal].password as any;
  }
  public get host(): URL.Host<T> {
    return this[internal].host as any;
  }
  public get hostname(): URL.Hostname<T> {
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
  public get search(): URL.Search<T> {
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
  public get searchParams(): URLSearchParams {
    return this[internal].searchParams;
  }
  public toString(): string {
    return this.href;
  }
  public toJSON(): string {
    return this.href;
  }
}
export namespace URL {
  export type Href<T extends string> = URLSegment<'href'> & Fix<T>;
  export type Resource<T extends string> = URLSegment<'resource'> & Fix<T>;
  export type Origin<T extends string> = URLSegment<'origin'> & Fix<T>;
  export type Scheme = URLSegment<'scheme'> & string;
  export type Protocol = URLSegment<'protocol'> & string;
  export type Username = URLSegment<'username'> & string;
  export type Password = URLSegment<'password'> & string;
  export type Host<T extends string> = URLSegment<'host'> & Fix<T>;
  export type Hostname<T extends string> = URLSegment<'hostname'> & Fix<T>;
  export type Port = URLSegment<'port'> & string;
  export type Path<T extends string> = URLSegment<'path'> & Fix<T>;
  export type Pathname<T extends string> = URLSegment<'pathname'> & Fix<T>;
  export type Search<T extends string> = URLSegment<'search'> & Fix<T>;
  export type Query<T extends string> = URLSegment<'query'> & Fix<T>;
  export type Hash<T extends string> = URLSegment<'hash'> & Fix<T>;
  export type Fragment<T extends string> = URLSegment<'fragment'> & Fix<T>;
}

declare class URLSegment<T extends string> {
  private readonly URL: T;
}
