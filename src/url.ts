import { AbsoluteURL, ReadonlyURL } from './url/format';

export { type StandardURL, standardize } from './url/format';
export { ReadonlyURL } from './url/format';

type Widen<T> = T extends `${infer _}` ? string : T;

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
    this.url = new ReadonlyURL(source, base!);
    assert(this.url.href.endsWith(`${this.port}${this.pathname}${this.query}${this.fragment}`));
    assert(this.href === this.url.href);
    //assert(this.href.startsWith(this.resource));
    assert(this.origin === this.url.origin);
    assert(this.protocol === this.url.protocol);
    assert(this.host === this.url.host);
    assert(this.hostname === this.url.hostname);
    assert(this.port === this.url.port);
  }
  private readonly url: ReadonlyURL;
  private params: URLSearchParams | undefined;
  public get href(): URL.Href<T> {
    return this.params?.toString().replace(/^(?=.)/, `${this.url.href.slice(0, -this.url.query.length - this.url.fragment.length || this.url.href.length)}?`).concat(this.fragment)
        ?? this.url.href as any;
  }
  public get resource(): URL.Resource<T> {
    return this.params?.toString().replace(/^(?=.)/, `${this.url.href.slice(0, -this.url.query.length - this.url.fragment.length || this.url.href.length)}?`)
        ?? this.url.resource as any;
  }
  public get origin(): URL.Origin<T> {
    return this.url.origin as any;
  }
  public get scheme(): URL.Scheme {
    return this.url.protocol.slice(0, -1) as any;
  }
  public get protocol(): URL.Protocol {
    return this.url.protocol as any;
  }
  public get username(): URL.Username {
    return this.url.username as any;
  }
  public get password(): URL.Password {
    return this.url.password as any;
  }
  public get host(): URL.Host<T> {
    return this.url.host as any;
  }
  public get hostname(): URL.Hostname<T> {
    return this.url.hostname as any;
  }
  public get port(): URL.Port {
    return this.url.port as any;
  }
  public get path(): URL.Path<T> {
    return this.params?.toString().replace(/^(?=.)/, `${this.pathname}?`)
        ?? this.url.path as any;
  }
  public get pathname(): URL.Pathname<T> {
    return this.url.pathname as any;
  }
  public get search(): URL.Search<T> {
    return this.params?.toString().replace(/^(?=.)/, '?')
        ?? this.url.search as any;
  }
  public get query(): URL.Query<T> {
    return this.params?.toString().replace(/^(?=.)/, '?')
        ?? this.url.query as any;
  }
  public get hash(): URL.Hash<T> {
    return this.url.hash as any;
  }
  public get fragment(): URL.Fragment<T> {
    return this.url.fragment as any;
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
