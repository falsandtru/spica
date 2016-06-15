import {Sequence} from '../../core';

export default class <T, S> extends Sequence<T, S> {
  public iterate(): Sequence.Thunk<T> {
    return this.iterate_();
  }
  private iterate_(p?: S, i = 0): Sequence.Thunk<T> {
    const data = this.memory
      ? this.memory.has(i)
        ? this.memory.get(i)
        : this.memory.set(i, this.cons(p, Sequence.Data.cons)).get(i)
      : this.cons(p, Sequence.Data.cons);
    switch (data.length) {
      case 0:
        return <Sequence.Thunk<T>>[
          void 0,
          Sequence.Iterator.done,
          -1
        ];
      case 1:
        return <Sequence.Thunk<T>>[
          data[0],
          () => Sequence.Iterator.done(),
          i
        ];
      case 2:
        return <Sequence.Thunk<T>>[
          data[0],
          () => this.iterate_(data[1], i + 1),
          i
        ];
      default:
        throw Sequence.Exception.invalidDataError(data);
    }
  }
}
