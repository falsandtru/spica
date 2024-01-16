// 100,000以上でforより大幅に低速となり実用不可
export function duff(count: number, proc: (index: number) => void): void {
  if (count > 0) {
    let i = 0;
    const m = count & 7, d = (count - m) / 8;
    for (let j = 0; j < m; ++j) {
      proc(i++);
    }
    for (let j = 0; j < d; ++j) {
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
    let i = -count;
    const m = i & 7, d = (i - m) / 8;
    for (let j = 0; j < m; ++j) {
      proc(--i);
    }
    for (let j = 0; j < d; ++j) {
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

// 100,000以上でforより大幅に低速となり実用不可
export function duffbk(count: number, proc: (index: number) => unknown): void {
  if (count > 0) {
    let i = 0;
    const m = count & 7, d = (count - m) / 8;
    for (let j = 0; j < m; ++j) {
      if (proc(i++) === false) return;
    }
    for (let j = 0; j < d; ++j) {
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
    let i = -count;
    const m = i & 7, d = (i - m) / 8;
    for (let j = 0; j < m; ++j) {
      if (proc(--i) === false) return;
    }
    for (let j = 0; j < d; ++j) {
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
  let i = 0;
  const m = count & 7, d = (count - m) / 8;
  for (let j = 0; j < m; ++j) {
    proc(array[i], i++, array);
  }
  for (let j = 0; j < d; ++j) {
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

// ベンチマークの10,000以上で急激な速度低下が見られる場合があるがNodeListなどでの
// 実際の使用では速度低下は見られない
export function duffReduce<T, U>(array: ArrayLike<T>, proc: (prev: U, value: T, index: number, array: ArrayLike<T>) => U, initial: U): U {
  let count = array.length;
  let i = 0;
  const m = count & 7, d = (count - m) / 8;
  let acc = initial;
  for (let j = 0; j < m; ++j) {
    acc = proc(acc, array[i], i++, array);
  }
  for (let j = 0; j < d; ++j) {
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
