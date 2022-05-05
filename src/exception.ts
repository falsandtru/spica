import { Promise } from './global';

export function causeAsyncException(reason: unknown): void {
  assert(!+console.error(reason));
  Promise.reject(reason);
}
