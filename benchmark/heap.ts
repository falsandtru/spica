import { benchmark } from './benchmark';
import { Heap } from '../src/heap';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('Heap', function () {
    it('Heap new', function (done) {
      benchmark('Heap new', () => new Heap(), done);
    });

    for (const length of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Heap insert/extract ${length.toLocaleString('en')}`, function (done) {
        const heap = new Heap<number>();
        for (let i = 0; i < length; ++i) heap.insert(i, 1);
        let i = 0;
        benchmark(`Heap insert/extract ${length.toLocaleString('en')}`, () => heap.extract() && heap.insert(1, length - i++ % length), done);
      });
    }

  });

});
