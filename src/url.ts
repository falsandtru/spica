import { formatURLForEdge } from './url/domain/format';

export { StandardURL, standardize } from './url/domain/format';

const global: typeof globalThis = typeof globalThis !== 'undefined' && globalThis || eval('self');
const location = { get href() { return global['location'] && global['location'].href; } };

export class URL<T extends string> {
  constructor(url: URL.Reference<T> | URL.Resource<T> | URL.Origin<T>, base?: string)
  constructor(url: URL.Reference<T> | URL.Resource<T> | URL.Origin<T> | URL.Path<T> | URL.Pathname<T> | URL.Query<T> | URL.Fragment<T>, base?: string)
  constructor(url: URLSegment<string> & string, base?: string)
  constructor(url: T, base?: string)
  constructor(url: string, base: string = location.href) {
    this.url = new global.URL(formatURLForEdge(url, base), base);
    assert(this.url.href.startsWith(this.url.protocol));
    Object.freeze(this);
  }
  private readonly url: globalThis.URL;
  public get reference(): URL.Reference<T> {
    assert(this.url.href === `${this.origin}${this.path}${this.fragment}`);
    return this.url.href as any;
  }
  public get resource(): URL.Resource<T> {
    return `${this.origin}${this.pathname}${this.query === '?' ? '' : this.query}` as any;
  }
  public get origin(): URL.Origin<T> {
    return `${this.protocol}//${this.host}` as any;
  }
  public get scheme(): URL.Scheme {
    return this.url.protocol.slice(0, -1) as any;
  }
  public get protocol(): URL.Protocol {
    return this.url.protocol as any;
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
  public get path(): URL.Path<T> {
    return `${this.pathname}${this.query}` as any;
  }
  public get pathname(): URL.Pathname<T> {
    return this.url.pathname as any;
  }
  public get query(): URL.Query<T> {
    return this.url.search || !this.url.href.split('#', 1)[0].includes('?')
      ? this.url.search as any
      : '?';
  }
  public get fragment(): URL.Fragment<T> {
    return this.url.hash || !this.url.href.includes('#')
      ? this.url.hash as any
      : '#';
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
