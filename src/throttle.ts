export function throttle<T>(interval: number, callback: (last: T, buffer: T[]) => void): (arg: T) => void {
  let timer = 0;
  let buffer: T[] = [];
  return (arg: T) => {
    void buffer.push(arg);
    if (timer > 0) return;
    timer = setTimeout(() => {
      assert(timer > 0);
      assert(buffer.length > 0);
      timer = 0;
      void callback(buffer[buffer.length - 1], flush());
    }, interval);
  };

  function flush(): T[] {
    const buf = buffer;
    buffer = [];
    return buf;
  }
}

export function debounce<T>(delay: number, callback: (last: T, buffer: T[]) => void): (arg: T) => void {
  let timer = 0;
  let buffer: T[] = [];
  return (arg: T) => {
    void buffer.push(arg);
    if (timer > 0) return;
    timer = setTimeout(() => {
      assert(timer > 0);
      assert(buffer.length > 0);
      timer = 0;
      void setTimeout(() => {
        if (timer > 0) return;
        assert(buffer.length > 0);
        void callback(buffer[buffer.length - 1], flush());
      }, delay);
    }, delay);
  };

  function flush(): T[] {
    const buf = buffer;
    buffer = [];
    return buf;
  }
}
