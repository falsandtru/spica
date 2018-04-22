import { Sequence } from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public unique(): Sequence<a, Sequence.Iterator<a>> {
    const memory = new Set<a>();
    return this.filter(a =>
      !memory.has(a) && !!memory.add(a));
  }
}
