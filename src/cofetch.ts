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

class Cofetch extends Promise<XMLHttpRequest> implements AsyncIterable<ProgressEvent> {
  static get [Symbol.species]() {
    return Promise;
  }
  constructor(
    xhr: XMLHttpRequest,
  ) {
    const co = new Coroutine<XMLHttpRequest, ProgressEvent>(async function* (): AsyncIterableIterator<ProgressEvent | XMLHttpRequest> {
      ['error', 'abort', 'timeout']
        .forEach(type =>
          xhr.addEventListener(type, ev =>
            void this.terminate(ev)));
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
    super(resolve => resolve(co));
    this.co = co;
    this.xhr = xhr;
  }
  private readonly co: Coroutine<XMLHttpRequest, ProgressEvent>;
  private readonly xhr: XMLHttpRequest;
  public cancel(): void {
    this.xhr.readyState < 4 &&
    this.xhr.abort();
  }
  public [Symbol.asyncIterator](): AsyncIterableIterator<ProgressEvent> {
    return this.co[Symbol.asyncIterator]();
  }
}
