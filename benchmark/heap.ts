import { benchmark } from './benchmark';
import { Heap, MultiHeap } from '../src/heap';

describe('Benchmark:', function () {
  describe('Heap', function () {
    it('Heap new', function (done) {
      benchmark('Heap new', () => new Heap(), done);
    });

    it.skip('MultiHeap new', function (done) {
      benchmark('MultiHeap new', () => new MultiHeap(), done);
    });

    for (const length of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Heap insert/extract ${length.toLocaleString('en')}`, function (done) {
        const heap = new Heap<number>(Heap.min);
        for (let i = 0; i < length; ++i) heap.insert(1, i);
        let i = 0;
        benchmark(`Heap insert/extract ${length.toLocaleString('en')}`, () =>
          heap.extract() && heap.insert(1, i = i++ % length), done);
      });

      it.skip(`MultiHeap insert/extract ${length.toLocaleString('en')}`, function (done) {
        const heap = new MultiHeap<number>(MultiHeap.min);
        for (let i = 0; i < length; ++i) heap.insert(1, i);
        let i = 0;
        benchmark(`MultiHeap insert/extract ${length.toLocaleString('en')}`, () =>
          heap.extract() && heap.insert(1, i = i++ % length), done);
      });
    }

  });

});
