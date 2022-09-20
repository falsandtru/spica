import { Promise } from './global';
import { Stack } from './stack';

const stack = new Stack<unknown[]>();

export function causeAsyncException(reason: unknown): void {
  if (stack.isEmpty()) {
    assert(!+console.error(reason));
    assert(eval('throw reason'));
    Promise.reject(reason);
  }
  else {
    stack.peek()!.push(reason);
  }
}
export function suppressAsyncException<f extends (done: (err?: unknown) => void) => unknown>(test: f): f {
  return (done => {
    stack.push([]);
    return test(err => {
      stack.pop();
      done(err);
    });
  }) as f;
}
