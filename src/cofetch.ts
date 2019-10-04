import { Coroutine } from './coroutine';
import { Colistener } from './colistener';
import { Cancellation } from './cancellation';
import { Collection } from './collection';
import { URL } from './url';
import { concat } from './concat';

export interface CofetchOptions {
  method?: string;
  headers?: Headers;
  body?: Document | BodyInit | null;
  responseType?: XMLHttpRequestResponseType;
  timeout?: number;
  withCredentials?: boolean;
  cache?: Collection<string, XMLHttpRequest>;
}

const memory = new WeakMap<XMLHttpRequest, { expiry: number; }>();

export function cofetch(url: string, options?: CofetchOptions): Cofetch {
  return new Cofetch(url, options);
}

class Cofetch extends Coroutine<XMLHttpRequest, ProgressEvent> {
  constructor(
    url: string,
    opts: CofetchOptions = {},
  ) {
    super(async function* (this: Cofetch) {
      void this.finally(this.cancel);
      url = new URL(url).reference;
      opts = { ...opts };
      opts.method = (opts.method || 'GET').toUpperCase();
      opts.headers = new Headers(opts.headers);
      let state: 'load' | 'error' | 'abort' | 'timeout';
      const key = `${opts.method}:${url}`;
      const xhr = new XMLHttpRequest();
      const listener = new Colistener<ProgressEvent>(listener => {
        void xhr.addEventListener('loadstart', listener);
        void xhr.addEventListener('progress', listener);
        void xhr.addEventListener('loadend', listener);
        for (const type of ['load', 'error', 'abort', 'timeout'] as const) {
          void xhr.addEventListener(type, () => state = type);
        }
        if (['GET', 'PUT'].includes(opts.method!) &&
            opts.cache && opts.cache.has(key) && memory.has(opts.cache.get(key)!) &&
            Date.now() > memory.get(opts.cache.get(key)!)!.expiry) {
          void opts.headers!.set('If-None-Match', opts.cache.get(key)!.getResponseHeader('ETag')!);
        }
        void fetch(xhr, url, opts);
        void this.cancellation.register(() =>
          xhr.readyState < 4 &&
          void xhr.abort());
        return () => undefined;
      });
      for await (const ev of listener) {
        assert(ev instanceof ProgressEvent);
        assert(['loadstart', 'progress', 'loadend'].includes(ev.type));
        yield ev;
        if (ev.type === 'loadend') break;
      }
      assert(state! !== undefined);
      switch (state!) {
        case 'load':
          if (opts.cache) {
            switch (opts.method) {
              case 'GET':
              case 'PUT':
                if (xhr.statusText.match(/2../)) {
                  const cc = new Map<string, string>(
                    xhr.getResponseHeader('Cache-Control')
                      ? xhr.getResponseHeader('Cache-Control')!.trim().split(/\s*,\s*/)
                          .filter(v => v.length > 0)
                          .map(v => concat(v.split('='), ['']) as [string, string])
                      : []);
                  if (xhr.getResponseHeader('ETag') && !cc.has('no-store')) {
                    void memory.set(xhr, {
                      expiry: cc.has('max-age') && !cc.has('no-cache')
                        ? Date.now() + +cc.get('max-age')! * 1000 || 0
                        : 0,
                    });
                    void opts.cache.set(key, xhr);
                  }
                  else {
                    void memory.delete(xhr);
                    void opts.cache.delete(key);
                  }
                }
                if (xhr.status === 304 && opts.cache.has(key)) {
                  return opts.cache.get(key)!;
                }
                break;
            }
          }
          return xhr;
        default:
          return xhr;
      }
    });
    void this[Coroutine.init]();
  }
  private readonly cancellation = new Cancellation();
  public cancel(): void {
    void this.cancellation.cancel();
  }
}

function fetch(xhr: XMLHttpRequest, url: string, opts: CofetchOptions): void {
  assert(xhr.readyState === 0);
  assert(opts.method);
  void xhr.open(opts.method!, url);
  for (const key of Object.keys(opts)) {
    switch (key) {
      case 'method':
      case 'body':
      case 'cache':
        continue;
      case 'headers':
        for (const [name, value] of opts.headers || []) {
          void xhr.setRequestHeader(name, value);
        }
        continue;
      default:
        if (key in xhr) xhr[key] = opts[key];
        continue;
    }
  }
  void xhr.send(opts.body);
}
