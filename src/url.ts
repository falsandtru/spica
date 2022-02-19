import { URLSearchParams } from './global';
import { AbsoluteURL, ReadonlyURL } from './url/format';

export { StandardURL, standardize } from './url/format';
export { ReadonlyURL } from './url/format';

type Widen<T> = T extends `${infer _}` ? string : T;

const internal = Symbol.for('spica/url::internal');

export class URL<T extends string> implements Readonly<global.URL> {
  constructor(url: URL.Href<T> | URL.Resource<T> | URL.Origin<T>, base?: string);
  constructor(url: URLSegment<string> & T, base: T);
  constructor(url: T, ...base:
    T extends URLSegment<string> & infer U ? [U] :
    T extends AbsoluteURL | `${string}:${string}` ? [string?] :
    T extends `${infer _}` ? [string] :
    [T]);
  constructor(
    public readonly source: string,
    public readonly base?: string,
  ) {
    this[internal] = {
      url: new ReadonlyURL(source, base!),
      searchParams: void 0,
    };
    assert(this[internal].url.href.endsWith(`${this.port}${this.pathname}${this.query}${this.fragment}`));
    assert(this.href === this[internal].url.href);
    //assert(this.href.startsWith(this.resource));
    assert(this.origin === this[internal].url.origin);
    assert(this.protocol === this[internal].url.protocol);
    assert(this.host === this[internal].url.host);
    assert(this.hostname === this[internal].url.hostname);
    assert(this.port === this[internal].url.port);
  }
  private readonly [internal]: {
    url: ReadonlyURL;
    searchParams: URLSearchParams | undefined;
  };
  public get href(): URL.Href<T> {
    return this[internal].searchParams?.toString().replace(/^(?=.)/, `${this[internal].url.href.slice(0, -this[internal].url.query.length - this[internal].url.fragment.length || this[internal].url.href.length)}?`).concat(this.fragment)
        ?? this[internal].url.href as any;
  }
  public get resource(): URL.Resource<T> {
    return this[internal].searchParams?.toString().replace(/^(?=.)/, `${this[internal].url.href.slice(0, -this[internal].url.query.length - this[internal].url.fragment.length || this[internal].url.href.length)}?`)
        ?? this[internal].url.resource as any;
  }
  public get origin(): URL.Origin<T> {
    return this[internal].url.origin as any;
  }
  public get scheme(): URL.Scheme {
    return this[internal].url.protocol.slice(0, -1) as any;
  }
  public get protocol(): URL.Protocol {
    return this[internal].url.protocol as any;
  }
  public get username(): URL.Username {
    return this[internal].url.username as any;
  }
  public get password(): URL.Password {
    return this[internal].url.password as any;
  }
  public get host(): URL.Host<T> {
    return this[internal].url.host as any;
  }
  public get hostname(): URL.Hostname<T> {
    return this[internal].url.hostname as any;
  }
  public get port(): URL.Port {
    return this[internal].url.port as any;
  }
  public get path(): URL.Path<T> {
    return this[internal].searchParams?.toString().replace(/^(?=.)/, `${this.pathname}?`)
        ?? this[internal].url.path as any;
  }
  public get pathname(): URL.Pathname<T> {
    return this[internal].url.pathname as any;
  }
  public get search(): URL.Search<T> {
    return this[internal].searchParams?.toString().replace(/^(?=.)/, '?')
        ?? this[internal].url.search as any;
  }
  public get query(): URL.Query<T> {
    return this[internal].searchParams?.toString().replace(/^(?=.)/, '?')
        ?? this[internal].url.query as any;
  }
  public get hash(): URL.Hash<T> {
    return this[internal].url.hash as any;
  }
  public get fragment(): URL.Fragment<T> {
    return this[internal].url.fragment as any;
  }
  public get searchParams(): URLSearchParams {
    return this[internal].searchParams
       ??= new URLSearchParams(this.search);
  }
  public toString(): string {
    return this.href;
  }
  public toJSON(): string {
    return this.href;
  }
}
export namespace URL {
  export type Href<T extends string> = URLSegment<'href'> & Widen<T>;
  export type Resource<T extends string> = URLSegment<'resource'> & Widen<T>;
  export type Origin<T extends string> = URLSegment<'origin'> & Widen<T>;
  export type Scheme = URLSegment<'scheme'> & string;
  export type Protocol = URLSegment<'protocol'> & string;
  export type Username = URLSegment<'username'> & string;
  export type Password = URLSegment<'password'> & string;
  export type Host<T extends string> = URLSegment<'host'> & Widen<T>;
  export type Hostname<T extends string> = URLSegment<'hostname'> & Widen<T>;
  export type Port = URLSegment<'port'> & string;
  export type Path<T extends string> = URLSegment<'path'> & Widen<T>;
  export type Pathname<T extends string> = URLSegment<'pathname'> & Widen<T>;
  export type Search<T extends string> = URLSegment<'search'> & Widen<T>;
  export type Query<T extends string> = URLSegment<'query'> & Widen<T>;
  export type Hash<T extends string> = URLSegment<'hash'> & Widen<T>;
  export type Fragment<T extends string> = URLSegment<'fragment'> & Widen<T>;
}

declare class URLSegment<T extends string> {
  private readonly URL: T;
}
