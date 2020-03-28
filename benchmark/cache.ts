import { benchmark } from './benchmark';
import { Cache } from '../';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('Cache', function () {
    it('new', function (done) {
      benchmark('Cache new', () => new Cache(1000), done);
    });

    it('put 10', function (done) {
      const capacity = 10;
      const cache = new Cache<number, number>(capacity);
      let i = 0;
      benchmark('Cache put 10', () => cache.put(++i % (capacity * 3), i), done);
    });

    it('put 100', function (done) {
      const capacity = 100;
      const cache = new Cache<number, number>(capacity);
      let i = 0;
      benchmark('Cache put 100', () => cache.put(++i % (capacity * 3), i), done);
    });

    it('put 1000', function (done) {
      const capacity = 1000;
      const cache = new Cache<number, number>(capacity);
      let i = 0;
      benchmark('Cache put 1000', () => cache.put(++i % (capacity * 3), i), done);
    });

    it('get 10', function (done) {
      const capacity = 10;
      const cache = new Cache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.put(i, i);
      let i = 0;
      benchmark('Cache get 10', () => cache.get(++i % (capacity * 3)), done);
    });

    it('get 100', function (done) {
      const capacity = 100;
      const cache = new Cache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.put(i, i);
      let i = 0;
      benchmark('Cache get 100', () => cache.get(++i % (capacity * 3)), done);
    });

    it('get 1000', function (done) {
      const capacity = 1000;
      const cache = new Cache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.put(i, i);
      let i = 0;
      benchmark('Cache get 1000', () => cache.get(++i % (capacity * 3)), done);
    });

    it('has 10', function (done) {
      const capacity = 10;
      const cache = new Cache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.put(i, i);
      let i = 0;
      benchmark('Cache has 10', () => cache.has(++i % (capacity * 3)), done);
    });

    it('has 100', function (done) {
      const capacity = 100;
      const cache = new Cache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.put(i, i);
      let i = 0;
      benchmark('Cache has 100', () => cache.has(++i % (capacity * 3)), done);
    });

    it('has 1000', function (done) {
      const capacity = 1000;
      const cache = new Cache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.put(i, i);
      let i = 0;
      benchmark('Cache has 1000', () => cache.has(++i % (capacity * 3)), done);
    });

  });

});
