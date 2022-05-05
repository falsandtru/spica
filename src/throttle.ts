import { setTimeout } from './global';
import { causeAsyncException } from './exception';

export function throttle<T, C = unknown>(interval: number, callback: (this: C, last: T, buffer: T[]) => void, capacity: number = 1): (this: C, arg: T) => void {
  // Bug: Karma and TypeScript
  let timer: ReturnType<typeof setTimeout> | 0 = 0;
  let buffer: T[] = [];
  return function self(this: unknown, data: T) {
    if (capacity === 1) {
      buffer = [data];
    }
    else {
      buffer.length === capacity && buffer.pop();
      buffer.unshift(data);
    }
    if (timer !== 0) return;
    timer = setTimeout(async () => {
      assert(timer !== 0);
      assert(buffer.length > 0);
      const buf = buffer;
      buffer = [];
      assert(buf.length > 0);
      try {
        await callback.call(this, buf[0], buf);
      }
      catch (reason) {
        causeAsyncException(reason);
      }
      timer = 0;
      buffer.length > 0 && self.call(this, buffer.shift()!);
    }, interval);
  };
}

export function debounce<T, C = unknown>(delay: number, callback: (this: C, last: T, buffer: T[]) => void, capacity: number = 1): (this: C, arg: T) => void {
  // Bug: Karma and TypeScript
  let timer: ReturnType<typeof setTimeout> | 0 = 0;
  let buffer: T[] = [];
  let callable = true;
  return function self(this: unknown, data: T) {
    if (capacity === 1) {
      buffer = [data];
    }
    else {
      buffer.length === capacity && buffer.pop();
      buffer.unshift(data);
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
          await callback.call(this, buf[0], buf);
        }
        catch (reason) {
          causeAsyncException(reason);
        }
        callable = true;
        timer === 0 && buffer.length > 0 && self.call(this, buffer.shift()!);
      }, delay);
    }, delay);
  };
}
