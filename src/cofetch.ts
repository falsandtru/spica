import { Coroutine } from './coroutine';
import { Cancellation } from './cancellation';

interface Headers {
  entries(): IterableIterator<[string, string]>;
}

export interface CofetchOptions {
  method?: string;
  headers?: Headers;
  body?: FormData | null;
  responseType?: XMLHttpRequestResponseType;
  timeout?: number;
  withCredentials?: boolean;
}

export function cofetch(url: string, options: CofetchOptions = {}): Cofetch {
  return new Cofetch(fetch(url, options));

  function fetch(url: string, options: CofetchOptions): XMLHttpRequest {
    const xhr = new XMLHttpRequest();
    void xhr.open(options.method || 'GET', url);
    for (const key of Object.keys(options)) {
      switch (key) {
        case 'method':
        case 'body':
          continue;
        case 'headers':
          [...options.headers!.entries()]
            .forEach(([name, value]) =>
              void xhr.setRequestHeader(name, value));
          continue;
        default:
          if (key in xhr) xhr[key] = options[key];
          continue;
      }
    }
    void xhr.send(options.body || null);
    return xhr;
  }
}

class Cofetch extends Coroutine<XMLHttpRequest, ProgressEvent> {
  constructor(
    xhr: XMLHttpRequest
  ) {
    super(async function* () {
      assert(xhr.readyState < 4);
      ['error', 'abort', 'timeout']
        .forEach(type =>
          void xhr.addEventListener(type, this[Coroutine.terminator].bind(this)));
      void cancellation.register(() =>
        xhr.readyState < 4 &&
        void xhr.abort());
      delete this[Coroutine.port as any];
      assert(!this[Coroutine.port]);
      this[Coroutine.terminator] = undefined as never;
      assert(!this[Coroutine.terminator]);
      const complete = new Promise<ProgressEvent>(resolve => xhr.addEventListener('load', resolve as any));
      try {
        while (xhr.readyState < 4) {
          const ev = await Promise.race([
            new Promise<ProgressEvent>(resolve => xhr.addEventListener('progress', resolve, { once: true })),
            complete,
          ]);
          if (ev.type !== 'progress') continue;
          yield ev;
        }
        yield complete;
      }
      catch (_) { // Don't use optional catch binding to make this code usable with esnext and browserify.
        void cancellation.cancel();
      }
      return xhr;
    });
    const cancellation = new Cancellation();
    this.cancel = cancellation.cancel;
  }
  public readonly cancel: () => void;
}
