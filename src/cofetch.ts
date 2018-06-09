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

export function cofetch(url: string, options?: CofetchOptions): Cofetch {
  return new Cofetch(url, options);
}

class Cofetch extends Coroutine<XMLHttpRequest, ProgressEvent> {
  constructor(
    url: string,
    opts: CofetchOptions = {},
  ) {
    super(async function* (this: Cofetch) {
      this[Coroutine.destructor] = this.cancel;
      const xhr = new XMLHttpRequest();
      const state = new Cancellation<ProgressEvent>();
      const process = new Colistener<ProgressEvent, XMLHttpRequest>(listener => {
        void xhr.addEventListener('loadstart', listener);
        void xhr.addEventListener('progress', listener);
        void xhr.addEventListener('loadend', listener);
        void ['error', 'abort', 'timeout']
          .forEach(type =>
            void xhr.addEventListener(type, state.cancel));
        void fetch(xhr, url, opts);
        void this.cancellation.register(() =>
          xhr.readyState < 4 &&
          void xhr.abort());
        return () => undefined;
      });
      for await (const ev of process) {
        assert(ev instanceof ProgressEvent);
        assert(['loadstart', 'progress', 'loadend'].includes(ev.type));
        yield ev;
        if (ev.type !== 'loadend') continue;
        void state.either(xhr)
          .extract(
            process[Coroutine.terminator],
            process.close);
      }
      return process;
    }, {}, false);
    void this[Coroutine.run]();
  }
  private readonly cancellation = new Cancellation();
  public readonly cancel: () => void = this.cancellation.cancel;
}

function fetch(xhr: XMLHttpRequest, url: string, options: CofetchOptions): void {
  assert(xhr.readyState === 0);
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
  void xhr.send(options.body || undefined);
}
