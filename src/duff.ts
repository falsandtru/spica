export function duff(count: number, proc: (index: number) => void): void {
  if (count > 0) {
    let i = 0, m = count % 8, d = (count - m) / 8;
    while (m--) {
      proc(i++);
    }
    while (d--) {
      proc(i++);
      proc(i++);
      proc(i++);
      proc(i++);
      proc(i++);
      proc(i++);
      proc(i++);
      proc(i++);
    }
  }
  else {
    let i = -count, m = i % 8, d = (i - m) / 8;
    while (m--) {
      proc(--i);
    }
    while (d--) {
      proc(--i);
      proc(--i);
      proc(--i);
      proc(--i);
      proc(--i);
      proc(--i);
      proc(--i);
      proc(--i);
    }
  }
}

export function duffbk(count: number, proc: (index: number) => unknown): void {
  if (count > 0) {
    let i = 0, m = count % 8, d = (count - m) / 8;
    while (m--) {
      if (proc(i++) === false) return;
    }
    while (d--) {
      switch (false) {
        case proc(i++):
        case proc(i++):
        case proc(i++):
        case proc(i++):
        case proc(i++):
        case proc(i++):
        case proc(i++):
        case proc(i++):
          return;
      }
    }
  }
  else {
    let i = -count, m = i % 8, d = (i - m) / 8;
    while (m--) {
      if (proc(--i) === false) return;
    }
    while (d--) {
      switch (false) {
        case proc(--i):
        case proc(--i):
        case proc(--i):
        case proc(--i):
        case proc(--i):
        case proc(--i):
        case proc(--i):
        case proc(--i):
          return;
      }
    }
  }
}

export function duffEach<T>(array: ArrayLike<T>, proc: (value: T, index: number, array: ArrayLike<T>) => void): void {
  let count = array.length;
  let i = 0, m = count % 8, d = (count - m) / 8;
  while (m--) {
    proc(array[i], i++, array);
  }
  while (d--) {
    proc(array[i], i++, array);
    proc(array[i], i++, array);
    proc(array[i], i++, array);
    proc(array[i], i++, array);
    proc(array[i], i++, array);
    proc(array[i], i++, array);
    proc(array[i], i++, array);
    proc(array[i], i++, array);
  }
}

// ベンチマークの10,000以上で急激な速度低下が見られるがNodeListなどでの
// 実際の使用では速度低下は見られない
export function duffReduce<T, U>(array: ArrayLike<T>, proc: (prev: U, value: T, index: number, array: ArrayLike<T>) => U, initial: U): U {
  let count = array.length;
  let i = 0, m = count % 8, d = (count - m) / 8;
  let acc = initial;
  while (m--) {
    acc = proc(acc, array[i], i++, array);
  }
  while (d--) {
    acc = proc(acc, array[i], i++, array);
    acc = proc(acc, array[i], i++, array);
    acc = proc(acc, array[i], i++, array);
    acc = proc(acc, array[i], i++, array);
    acc = proc(acc, array[i], i++, array);
    acc = proc(acc, array[i], i++, array);
    acc = proc(acc, array[i], i++, array);
    acc = proc(acc, array[i], i++, array);
  }
  return acc;
}
