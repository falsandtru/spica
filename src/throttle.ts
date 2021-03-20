import { setTimeout } from './global';

export function throttle<T>(interval: number, callback: (last: T, buffer: T[]) => void, capacity: number = 1): (arg: T) => void {
  // Bug: Karma and TypeScript
  let timer: ReturnType<typeof setTimeout> | 0 = 0;
  let buffer: T[] = [];
  return (data: T) => {
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
      const buf = buffer;
      buffer = [];
      assert(buf.length > 0);
      void callback(buf[0], buf);
    }, interval);
  };
}

export function debounce<T>(delay: number, callback: (last: T, buffer: T[]) => void, capacity: number = 1): (arg: T) => void {
  // Bug: Karma and TypeScript
  let timer: ReturnType<typeof setTimeout> | 0 = 0;
  let buffer: T[] = [];
  return (data: T) => {
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
      void setTimeout(() => {
        if (timer !== 0) return;
        assert(buffer.length > 0);
        const buf = buffer;
        buffer = [];
        assert(buf.length > 0);
        void callback(buf[0], buf);
      }, buffer.length > 1 ? delay : 0);
    }, delay);
  };
}
