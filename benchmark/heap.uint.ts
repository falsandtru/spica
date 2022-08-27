import { benchmark } from './benchmark';
import { Heap } from '../src/heap.uint';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('Heap uint', function () {
    it('Heap uint new', function (done) {
      benchmark('Heap uint new', () => new Heap(), done);
    });

    for (const length of [10, 100, 1000, 10000, 100000, 1000000]) {
      it(`Heap uint insert/extract ${length.toLocaleString('en')}`, function (done) {
        const heap = new Heap<number>();
        for (let i = 0; i < length; ++i) heap.insert(i, 1);
        let i = 0;
        benchmark(`Heap uint insert/extract ${length.toLocaleString('en')}`, () => heap.extract() && heap.insert(i++ % length, 1), done);
      });
    }

  });

});
