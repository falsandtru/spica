import { Coroutine } from './coroutine';
import { Colistener } from './colistener';
import { Cancellation } from './cancellation';
import { Dict } from './dict';
import { ReadonlyURL } from './url';
import { noop } from './function';

export interface CofetchOptions {
  method?: string;
  headers?: Record<string, string> | Headers;
  body?: Document | XMLHttpRequestBodyInit | null;
  responseType?: XMLHttpRequestResponseType;
  timeout?: number;
  withCredentials?: boolean;
  cache?: Dict<string, XMLHttpRequest>;
}

const memory = new WeakMap<XMLHttpRequest, { expiration: number; }>();

export function cofetch(url: string, options?: CofetchOptions): Cofetch {
  return new Cofetch(url, options);
}

class Cofetch extends Coroutine<XMLHttpRequest, ProgressEvent> {
  constructor(
    url: string,
    opts: CofetchOptions = {},
  ) {
    super(async function* (this: Cofetch) {
      this.finally(this.cancel);
      assert(this.catch(console.error));
      url = new ReadonlyURL(url, location.href).href;
      opts = { ...opts };
      opts.method = (opts.method || 'GET').toUpperCase();
      opts.headers = new Headers(opts.headers);
      const { method, headers, cache } = opts;
      let state: 'load' | 'error' | 'abort' | 'timeout';
      const key = `${method}:${url}`;
      const xhr = new XMLHttpRequest();
      const listener = new Colistener<ProgressEvent>(listener => {
        xhr.addEventListener('loadstart', listener);
        xhr.addEventListener('progress', listener);
        xhr.addEventListener('loadend', listener);
        for (const type of ['load', 'error', 'abort', 'timeout'] as const) {
          xhr.addEventListener(type, () => state = type);
        }
        if (['GET', 'PUT'].includes(method) &&
            cache && cache.has(key) && memory.has(cache.get(key)!) &&
            Date.now() > memory.get(cache.get(key)!)!.expiration) {
          headers.set('If-None-Match', cache.get(key)!.getResponseHeader('ETag')!);
        }
        fetch(xhr, url, opts);
        this.cancellation.register(() => { xhr.readyState < 4 && xhr.abort(); });
        return noop;
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
          if (cache) {
            switch (method) {
              case 'GET':
              case 'PUT':
                if (`${xhr.status}`.match(/^2..$/)) {
                  const cc = new Map<string, string>(
                    xhr.getResponseHeader('Cache-Control')
                      // eslint-disable-next-line redos/no-vulnerable
                      ? xhr.getResponseHeader('Cache-Control')!.trim().split(/\s*,\s*/)
                          .filter(v => v.length > 0)
                          .map(v => [...v.split('='), ''] as [string, string])
                      : []);
                  if (xhr.getResponseHeader('ETag') && !cc.has('no-store')) {
                    memory.set(xhr, {
                      expiration: cc.has('max-age') && !cc.has('no-cache')
                        ? Date.now() + +cc.get('max-age')! * 1000 || 0
                        : 0,
                    });
                    cache.set(key, xhr);
                  }
                  else {
                    memory.delete(xhr);
                    cache.delete(key);
                  }
                }
                if (xhr.status === 304 && cache.has(key)) {
                  return cache.get(key)!;
                }
                break;
            }
          }
          return xhr;
        default:
          return xhr;
      }
    }, { run: false });
    this[Coroutine.init]();
  }
  private readonly cancellation = new Cancellation();
  public cancel(): void {
    this.cancellation.cancel();
  }
}

function fetch(xhr: XMLHttpRequest, url: string, opts: CofetchOptions): void {
  assert(xhr.readyState === 0);
  assert(opts.method);
  xhr.open(opts.method!, url);
  for (const key of Object.keys(opts)) {
    switch (key) {
      case 'method':
      case 'body':
      case 'cache':
        continue;
      case 'headers':
        (opts.headers as Headers).forEach(([name, value]) =>
          void xhr.setRequestHeader(name, value));
        continue;
      default:
        if (key in xhr) xhr[key] = opts[key];
        continue;
    }
  }
  xhr.send(opts.body);
}
