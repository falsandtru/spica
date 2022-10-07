export type List<T> = Node<T> | Nil;

export type Node<T> = [head: T, tail: List<T>];
export type Nil = undefined;

export function Node<T>(head: T, tail?: List<T>): Node<T> {
  return [head, tail];
}

export const Nil = undefined;
