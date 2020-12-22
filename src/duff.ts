// @ts-nocheck

export function duff(count: number, proc: (index: number) => void): void {
  if (count > 0) {
    let i = count;
    while (i > 0) {
      switch (i % 8) {
        case 0: proc(count - i--);
        case 7: proc(count - i--);
        case 6: proc(count - i--);
        case 5: proc(count - i--);
        case 4: proc(count - i--);
        case 3: proc(count - i--);
        case 2: proc(count - i--);
        case 1: proc(count - i--);
      }
    }
  }
  else {
    let i = -count;
    while (i > 0) {
      switch (i % 8) {
        case 0: proc(i--);
        case 7: proc(i--);
        case 6: proc(i--);
        case 5: proc(i--);
        case 4: proc(i--);
        case 3: proc(i--);
        case 2: proc(i--);
        case 1: proc(i--);
      }
    }
  }
}

export function duffbk(count: number, proc: (index: number) => unknown): void {
  if (count > 0) {
    let i = count;
    while (i > 0) {
      switch (i % 8) {
        case 0: if (proc(count - i--) === false) return;
        case 7: if (proc(count - i--) === false) return;
        case 6: if (proc(count - i--) === false) return;
        case 5: if (proc(count - i--) === false) return;
        case 4: if (proc(count - i--) === false) return;
        case 3: if (proc(count - i--) === false) return;
        case 2: if (proc(count - i--) === false) return;
        case 1: if (proc(count - i--) === false) return;
      }
    }
  }
  else {
    let i = -count;
    while (i > 0) {
      switch (i % 8) {
        case 0: if (proc(i--) === false) return;
        case 7: if (proc(i--) === false) return;
        case 6: if (proc(i--) === false) return;
        case 5: if (proc(i--) === false) return;
        case 4: if (proc(i--) === false) return;
        case 3: if (proc(i--) === false) return;
        case 2: if (proc(i--) === false) return;
        case 1: if (proc(i--) === false) return;
      }
    }
  }
}
