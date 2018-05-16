import { Coroutine } from './coroutine';
import { Colistener } from './colistener';
import { Cancellation } from './cancellation';

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
    super(async function* (this: Cofetch) {
      void this.catch(() => void this.cancel());
      assert(xhr.readyState < 4);
      ['error', 'abort', 'timeout']
        .forEach(type =>
          void xhr.addEventListener(type, this[Coroutine.terminator].bind(this)));
      void this.cancellation.register(() =>
        xhr.readyState < 4 &&
        void xhr.abort());
      this[Coroutine.terminator] = this.cancel;
      const complete = new Promise<ProgressEvent>(resolve => xhr.addEventListener('load', resolve as any));
      const events = new Colistener<ProgressEvent, never>(listener => (
        void xhr.addEventListener('progress', listener),
        () => xhr.removeEventListener('progress', listener)));
      void complete.then(events.close);
      for await (const ev of events) {
        assert(ev.type === 'progress');
        yield ev;
      }
      yield complete;
      return xhr;
    });
  }
  private readonly cancellation = new Cancellation();
  public readonly cancel: () => void = this.cancellation.cancel;
}
