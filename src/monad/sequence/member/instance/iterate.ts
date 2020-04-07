import { Sequence } from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public iterate(): Sequence.Thunk<a> {
    return this.iterate_();
  }
  private iterate_(z?: z, i = 0): Sequence.Thunk<a> {
    const data = this.cons(z!, Sequence.Data.cons);
    switch (data.length) {
      case 0:
        return <Sequence.Thunk<a>>[
          <a><unknown>void 0,
          Sequence.Iterator.done,
          -1
        ];
      case 1:
        return <Sequence.Thunk<a>>[
          data[0],
          () => Sequence.Iterator.done(),
          i
        ];
      case 2:
        return <Sequence.Thunk<a>>[
          data[0],
          () => this.iterate_(data[1] as z, i + 1),
          i
        ];
      default:
        throw Sequence.Exception.invalidDataError(data);
    }
  }
}
