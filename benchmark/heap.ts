import { benchmark } from './benchmark';
import { Heap } from '../src/heap';
import { PriorityQueue } from '../src/queue';
import { TimingWheel } from '../src/timingwheel';
import { xorshift } from '../src/random';

describe('Benchmark:', function () {
  describe('Heap', function () {
    it('Heap new', function (done) {
      benchmark('Heap new', () => new Heap(), done);
    });

    it('PQueue new', function (done) {
      benchmark('PQueue new', () => new PriorityQueue(), done);
    });

    it('TWheel new', function (done) {
      benchmark('TWheel new', () => new TimingWheel(), done);
    });

    for (const size of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Heap ${size.toLocaleString('en')}`, function (done) {
        const heap = new Heap<{}>();
        for (let i = 0; i < size; ++i) heap.insert({}, i);
        const random = xorshift.random(1);
        benchmark(`Heap ${size.toLocaleString('en')}`, () => {
          heap.delete(heap.peek()!);
          heap.insert(random() * size * 10 | 0, {});
        }, done);
      });

      it(`PQueue ${size.toLocaleString('en')}`, function (done) {
        const queue = new PriorityQueue<{}, number>();
        for (let i = 0; i < size; ++i) queue.push(i, {});
        const random = xorshift.random(1);
        benchmark(`PQueue ${size.toLocaleString('en')}`, () => {
          queue.pop();
          queue.push(random() * size * 10 | 0, {});
        }, done);
      });

      it(`TWheel ${size.toLocaleString('en')}`, function (done) {
        const wheel = new TimingWheel<{}>(0, 1);
        for (let i = 0; i < size; ++i) wheel.add(i, {});
        const random = xorshift.random(1);
        benchmark(`TWheel ${size.toLocaleString('en')}`, () => {
          wheel.delete(wheel.peek()!);
          wheel.add(random() * size * 10 | 0, {});
        }, done);
      });
    }

  });

});
