import { StandardURL, formatURLForEdge } from './url/domain/format';

export { StandardURL, standardize } from './url/domain/format';

const global: typeof globalThis = typeof globalThis !== 'undefined' && globalThis || eval('self');
const location = { get href() { return global['location'] && global['location'].href; } };

export class URL<T extends string> {
  constructor(url: URL.Reference<T> | URL.Resource<T> | URL.Origin<T>, base?: string)
  constructor(url: URL.Origin<T> | URL.Path<T> | URL.Pathname<T> | URL.Query<T> | URL.Fragment<T>, base?: T)
  constructor(url: URL.Fragment<string> & T, base?: T extends StandardURL ? string : T)
  constructor(url: T, base?: T extends StandardURL ? string : T)
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
    return `${this.origin}${this.path}`
      .replace(/\?(?=#|$)/, '') as any;
  }
  public get origin(): URL.Origin<T> {
    return `${this.protocol}//${this.host}` as any;
  }
  public get scheme(): URL.Scheme<T> {
    return this.url.protocol.slice(0, -1) as any;
  }
  public get protocol(): URL.Protocol<T> {
    return this.url.protocol as any;
  }
  public get host(): URL.Host<T> {
    return this.url.host as any;
  }
  public get hostname(): URL.Hostname<T> {
    return this.url.hostname as any;
  }
  public get port(): URL.Port<T> {
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
  export type Reference<T extends string> = URLFragment<'reference'> & T;
  export type Resource<T extends string> = URLFragment<'resource'> & T;
  export type Origin<T extends string> = URLFragment<'origin'> & T;
  export type Scheme<T extends string> = URLFragment<'scheme'> & T;
  export type Protocol<T extends string> = URLFragment<'protocol'> & T;
  export type Host<T extends string> = URLFragment<'host'> & T;
  export type Hostname<T extends string> = URLFragment<'hostname'> & T;
  export type Port<T extends string> = URLFragment<'port'> & T;
  export type Path<T extends string> = URLFragment<'path'> & T;
  export type Pathname<T extends string> = URLFragment<'pathname'> & T;
  export type Query<T extends string> = URLFragment<'query'> & T;
  export type Fragment<T extends string> = URLFragment<'fragment'> & T;
}

declare class URLFragment<T extends string> {
  private readonly URL: T;
}
