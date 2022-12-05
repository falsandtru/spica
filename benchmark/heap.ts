import { benchmark } from './benchmark';
import { Heap } from '../src/heap';
import { PriorityQueue } from '../src/queue';
import { TTL } from '../src/ttl';
import { xorshift } from '../src/random';
import { now } from '../src/chrono';

describe('Benchmark:', function () {
  describe('Heap', function () {
    it('Heap new', function (done) {
      benchmark('Heap new', () => new Heap(), done);
    });

    it('PQueue new', function (done) {
      benchmark('PQueue new', () => new PriorityQueue(), done);
    });

    it('TTL new', function (done) {
      benchmark('TTL new', () => new TTL(), done);
    });

    for (const size of [1e2, 1e3, 1e4, 1e5, 1e6]) {
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

      it(`TTL ${size.toLocaleString('en')}`, function (done) {
        const t = now();
        const ttl = new TTL<{}>(1);
        for (let i = 0; i < size; ++i) ttl.add(i, {});
        const random = xorshift.random(1);
        benchmark(`TTL ${size.toLocaleString('en')}`, () => {
          ttl.delete(ttl.peek()!);
          ttl.add(t + random() * size * 10 | 0, {});
        }, done);
      });
    }

  });

});
