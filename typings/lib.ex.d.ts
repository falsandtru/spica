interface String {
  split(separator: string | RegExp, limit?: number): string[];
}

interface Array<T> {
  split(separator: string | RegExp, limit?: number): T[];
}

interface PromiseLike<T> {
  _?: T;
}

declare const Promise: PromiseConstructorLike & {
  all<T>(ps: (T | Promise<T>)[]): Promise<T[]>;
  race<T>(ps: (T | Promise<T>)[]): Promise<T>;
};
interface Promise<T> extends PromiseLike<T> {
}
