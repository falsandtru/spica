import { Coroutine } from './coroutine';

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
    xhr.open(options.method || 'GET', url);
    xhr.send(options.body || null);
    for (const key of Object.keys(options)) {
      switch (key) {
        case 'method':
        case 'body':
          continue;
        case 'headers':
          [...options.headers!.entries()]
            .forEach(([name, value]) =>
              xhr.setRequestHeader(name, value));
          continue;
        default:
          if (key in xhr) xhr[key] = options[key];
          continue;
      }
    }
    return xhr;
  }
}

class Cofetch extends Coroutine<XMLHttpRequest, ProgressEvent> {
  constructor(
    private readonly xhr: XMLHttpRequest
  ) {
    super(async function* () {
      assert(xhr.readyState < 4);
      ['error', 'abort', 'timeout']
        .forEach(type =>
          xhr.addEventListener(type, this[Coroutine.terminator]));
      delete this[Coroutine.terminator];
      const complete = new Promise<ProgressEvent>(resolve => xhr.addEventListener('load', resolve as any));
      while (xhr.readyState < 4) {
        const ev = await Promise.race([
          new Promise<ProgressEvent>(resolve => xhr.addEventListener('progress', resolve, { once: true })),
          complete,
        ]);
        if (ev.type !== 'progress') continue;
        yield ev;
      }
      yield complete;
      return xhr;
    });
  }
  public readonly cancel = (): void => {
    this.xhr.readyState < 4 &&
    this.xhr.abort();
  };
}
