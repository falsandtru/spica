import { Coroutine } from './coroutine';
import { Colistener } from './colistener';
import { Cancellation } from './cancellation';
import { Collection } from './collection';

export interface CofetchOptions {
  method?: string;
  headers?: Headers;
  body?: Document | BodyInit | null;
  responseType?: XMLHttpRequestResponseType;
  timeout?: number;
  withCredentials?: boolean;
  cache?: Collection<string, { etag: string; expiry: number; xhr: XMLHttpRequest; }>;
}

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
      url = new URL(url, typeof location === 'object' ? location.href : undefined).href.split('#', 1)[0];
      opts = { ...opts };
      opts.method = (opts.method || 'GET').toUpperCase();
      opts.headers = new Headers(opts.headers || []);
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
        if (['GET', 'PUT'].includes(opts.method!) && opts.cache && opts.cache.has(key) && Date.now() > opts.cache.get(key)!.expiry) {
          void opts.headers!.set('If-None-Match', opts.cache.get(key)!.etag);
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
                  xhr.getResponseHeader('ETag') &&
                  !(xhr.getResponseHeader('Cache-Control') || '').trim().split(/\s*,\s*/).includes('no-store')
                    ? void opts.cache.set(key, {
                        etag: xhr.getResponseHeader('ETag')!,
                        expiry: xhr.getResponseHeader('Cache-Control')!.trim().split(/\s*,\s*/).includes('no-cache')
                          ? 0
                          : Date.now() + +(xhr.getResponseHeader('Cache-Control')!.trim().split(/\s*,\s*/).find(s => s.startsWith('max-age=')) || '').split('=')[1] * 1000 || 0,
                        xhr,
                      })
                    : void opts.cache.delete(key);
                }
                if (xhr.status === 304 && opts.cache.has(key)) {
                  return opts.cache.get(key)!.xhr;
                }
                break;
            }
          }
          return xhr;
        default:
          return xhr;
      }
    }, { syncrun: false });
    void this[Coroutine.run]();
  }
  private readonly cancellation = new Cancellation();
  public readonly cancel: () => void = this.cancellation.cancel;
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
