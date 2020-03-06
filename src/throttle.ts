import { MList } from './list';
import { setTimeout } from './global';

export function throttle<T>(interval: number, callback: (last: T, buffer: MList<T>) => void): (arg: T) => void {
  let timer = 0;
  let buffer = MList<T>();
  return (arg: T) => {
    buffer.prepend(arg);
    if (timer > 0) return;
    timer = setTimeout(() => {
      assert(timer > 0);
      assert(buffer.tail);
      timer = 0;
      const buf = flush();
      assert(buf.tail);
      void callback(buf.head, buf);
    }, interval);
  };

  function flush(): typeof buffer {
    const buf = buffer;
    buffer = MList();
    return buf;
  }
}

export function debounce<T>(delay: number, callback: (last: T, buffer: MList<T>) => void): (arg: T) => void {
  let timer = 0;
  let buffer = MList<T>();
  return (arg: T) => {
    buffer.prepend(arg);
    if (timer > 0) return;
    timer = setTimeout(() => {
      assert(timer > 0);
      assert(buffer.tail);
      timer = 0;
      void setTimeout(() => {
        if (timer > 0) return;
        assert(buffer.tail);
        const buf = flush();
        assert(buf.tail);
        void callback(buf.head, buf);
      }, buffer.length > 1 ? delay : 0);
    }, delay);
  };

  function flush(): typeof buffer {
    const buf = buffer;
    buffer = MList();
    return buf;
  }
}
