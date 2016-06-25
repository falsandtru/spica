import {Sequence} from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public memoize(memory: Map<number, Sequence.Data<a, z>> = this.memory || new Map<number, Sequence.Data<a, z>>()): Sequence<a, z> {
    return new Sequence<a, z>(this.cons, this.memory || memory);
  }
}
