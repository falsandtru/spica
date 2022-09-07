import { benchmark } from './benchmark';
import { Heap } from '../src/heap.uint';

describe('Benchmark:', function () {
  describe('Heap uint', function () {
    it('Heap uint new', function (done) {
      benchmark('Heap uint new', () => new Heap(), done);
    });

    for (const length of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Heap uint insert/extract ${length.toLocaleString('en')}`, function (done) {
        const heap = new Heap<number>();
        for (let i = 0; i < length; ++i) heap.insert(1, i);
        let i = 0;
        benchmark(`Heap uint insert/extract ${length.toLocaleString('en')}`, () => heap.extract() && heap.insert(1, i++ % length), done);
      });
    }

  });

});
