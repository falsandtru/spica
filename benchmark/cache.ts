import {benchmark} from './benchmark';
import {IContextDefinition} from 'mocha';
import {Cache} from 'spica';

describe('Benchmark:', function (this: IContextDefinition) {
  this.timeout(10 * 1e3);

  const size = 1000;

  describe('Cache', function () {
    it('put', function (done) {
      const cache = new Cache<number, number>(size);
      let i = 0;
      benchmark('Cache put', () => cache.put(++i % (size * 3), i), done);
    });

    it('get', function (done) {
      const cache = new Cache<number, number>(size);
      for (let i = 0; i < size; ++i) cache.put(i, i);
      let i = 0;
      benchmark('Cache get', () => cache.get(++i % (size * 3)), done);
    });

    it('has', function (done) {
      const cache = new Cache<number, number>(size);
      for (let i = 0; i < size; ++i) cache.put(i, i);
      let i = 0;
      benchmark('Cache has', () => cache.has(++i % (size * 3)), done);
    });

  });

});
