import { setTimeout } from './global';
import { now } from './clock';
import { causeAsyncException } from './exception';

export function throttle<T, C = unknown>(interval: number, callback: (this: C, last: T, buffer: T[]) => Promise<unknown> | unknown, capacity: number = 1): (this: C, arg: T) => void {
  // Bug: Karma and TypeScript
  let timer: ReturnType<typeof setTimeout> | 0 = 0;
  let buffer: T[] = [];
  return function self(this: C, data: T) {
    if (capacity === 1) {
      buffer = [data];
    }
    else {
      buffer.length === capacity && buffer.shift();
      buffer.push(data);
    }
    if (timer !== 0) return;
    timer = setTimeout(async () => {
      assert(timer !== 0);
      assert(buffer.length > 0);
      const buf = buffer;
      buffer = [];
      assert(buf.length > 0);
      try {
        await callback.call(this, buf[buf.length - 1], buf);
      }
      catch (reason) {
        causeAsyncException(reason);
      }
      timer = 0;
      buffer.length > 0 && self.call(this, buffer.pop()!);
    }, interval);
  };
}

export function debounce<T, C = unknown>(delay: number, callback: (this: C, last: T, buffer: T[]) => Promise<unknown> | unknown, capacity: number = 1): (this: C, arg: T) => void {
  // Bug: Karma and TypeScript
  let timer: ReturnType<typeof setTimeout> | 0 = 0;
  let buffer: T[] = [];
  let callable = true;
  return function self(this: C, data: T) {
    if (capacity === 1) {
      buffer = [data];
    }
    else {
      buffer.length === capacity && buffer.shift();
      buffer.push(data);
    }
    if (timer !== 0) return;
    timer = setTimeout(() => {
      assert(timer !== 0);
      assert(buffer.length > 0);
      timer = 0;
      setTimeout(async () => {
        if (timer !== 0) return;
        if (!callable) return;
        assert(buffer.length > 0);
        const buf = buffer;
        buffer = [];
        assert(buf.length > 0);
        callable = false;
        try {
          await callback.call(this, buf[buf.length - 1], buf);
        }
        catch (reason) {
          causeAsyncException(reason);
        }
        callable = true;
        assert(timer === 0);
        buffer.length > 0 && self.call(this, buffer.pop()!);
      }, delay);
    }, delay);
  };
}

export function cothrottle<T>(
  routine: () => AsyncGenerator<Awaited<T>>,
  resource: number,
  scheduler: () => PromiseLike<unknown>,
): () => AsyncGenerator<Awaited<T>> {
  return async function* () {
    let start = Date.now();
    for await (const value of routine()) {
      if (resource - (now() - start) > 0) {
        yield value;
      }
      else {
        await scheduler();
        start = now();
      }
    }
  };
}
