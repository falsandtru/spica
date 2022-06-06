import { benchmark } from './benchmark';
import { Heap } from '../src/heap';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('Heap', function () {
    it('Heap new', function (done) {
      benchmark('Heap new', () => new Heap(), done);
    });

    for (const length of [10, 100, 1000, 10000, 100000, 1000000]) {
      it(`Heap insert/extract ${length.toLocaleString('en')}`, function (done) {
        const capacity = length;
        const heap = new Heap<number>();
        for (let i = 0; i < capacity; ++i) heap.insert(i, 1);
        let i = 0;
        benchmark(`Heap insert/extract ${length.toLocaleString('en')}`, () => heap.extract() && heap.insert(++i, 1), done);
      });
    }

  });

});
