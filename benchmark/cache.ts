import { benchmark } from './benchmark';
import { Cache } from '../';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('Cache', function () {
    it('new', function (done) {
      benchmark('Cache new', () => new Cache(1000), done);
    });

    it('put 10', function (done) {
      const size = 10;
      const cache = new Cache<number, number>(size);
      let i = 0;
      benchmark('Cache put 10', () => cache.put(++i % (size * 3), i), done);
    });

    it('put 100', function (done) {
      const size = 100;
      const cache = new Cache<number, number>(size);
      let i = 0;
      benchmark('Cache put 100', () => cache.put(++i % (size * 3), i), done);
    });

    it('put 1000', function (done) {
      const size = 1000;
      const cache = new Cache<number, number>(size);
      let i = 0;
      benchmark('Cache put 1000', () => cache.put(++i % (size * 3), i), done);
    });

    it('get 10', function (done) {
      const size = 10;
      const cache = new Cache<number, number>(size);
      for (let i = 0; i < size; ++i) cache.put(i, i);
      let i = 0;
      benchmark('Cache get 10', () => cache.get(++i % (size * 3)), done);
    });

    it('get 100', function (done) {
      const size = 100;
      const cache = new Cache<number, number>(size);
      for (let i = 0; i < size; ++i) cache.put(i, i);
      let i = 0;
      benchmark('Cache get 100', () => cache.get(++i % (size * 3)), done);
    });

    it('get 1000', function (done) {
      const size = 1000;
      const cache = new Cache<number, number>(size);
      for (let i = 0; i < size; ++i) cache.put(i, i);
      let i = 0;
      benchmark('Cache get 1000', () => cache.get(++i % (size * 3)), done);
    });

    it('has 10', function (done) {
      const size = 10;
      const cache = new Cache<number, number>(size);
      for (let i = 0; i < size; ++i) cache.put(i, i);
      let i = 0;
      benchmark('Cache has 10', () => cache.has(++i % (size * 3)), done);
    });

    it('has 100', function (done) {
      const size = 100;
      const cache = new Cache<number, number>(size);
      for (let i = 0; i < size; ++i) cache.put(i, i);
      let i = 0;
      benchmark('Cache has 100', () => cache.has(++i % (size * 3)), done);
    });

    it('has 1000', function (done) {
      const size = 1000;
      const cache = new Cache<number, number>(size);
      for (let i = 0; i < size; ++i) cache.put(i, i);
      let i = 0;
      benchmark('Cache has 1000', () => cache.has(++i % (size * 3)), done);
    });

  });

});
