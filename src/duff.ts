// @ts-nocheck

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
      if (proc(i++) === false) return;
      if (proc(i++) === false) return;
      if (proc(i++) === false) return;
      if (proc(i++) === false) return;
      if (proc(i++) === false) return;
      if (proc(i++) === false) return;
      if (proc(i++) === false) return;
      if (proc(i++) === false) return;
    }
  }
  else {
    let i = -count, m = i % 8, d = (i - m) / 8;
    while (m--) {
      if (proc(--i) === false) return;
    }
    while (d--) {
      if (proc(--i) === false) return;
      if (proc(--i) === false) return;
      if (proc(--i) === false) return;
      if (proc(--i) === false) return;
      if (proc(--i) === false) return;
      if (proc(--i) === false) return;
      if (proc(--i) === false) return;
      if (proc(--i) === false) return;
    }
  }
}
