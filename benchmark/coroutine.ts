import { benchmark } from './benchmark';
import { Coroutine } from '..';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('Coroutine', function () {
    it('new', function (done) {
      benchmark('Coroutine new', () => new Coroutine(function* () { return undefined; }), done);
    });

    it.skip('new async', function (done) {
      benchmark('Coroutine new async', () => new Coroutine(async function* () { return undefined; }), done);
    });

    it('iterate', function (done) {
      const iter = new Coroutine(function* () {
        while (true) {
          yield;
        }
      }, { size: 1 })[Symbol.asyncIterator]();
      benchmark('Coroutine iterate', () => void iter.next(), done);
    });

    it('iterate async', function (done) {
      const iter = new Coroutine(async function* () {
        while (true) {
          yield;
        }
      }, { size: 1 })[Symbol.asyncIterator]();
      benchmark('Coroutine iterate async', () => void iter.next(), done);
    });

  });

});
