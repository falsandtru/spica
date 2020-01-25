import { benchmark } from './benchmark';
import { Coroutine } from '..';
import { AtomicPromise } from '..';

describe('Benchmark:', function () {
  this.timeout(30 * 1e3);
  afterEach(() => new AtomicPromise(requestAnimationFrame));

  describe('Coroutine', function () {
    it('new', function (done) {
      benchmark('Coroutine new', () => new Coroutine(function* () { }, { size: 1 }), done);
    });

    it('new async', function (done) {
      benchmark('Coroutine new async', () => new Coroutine(async function* () { }, { size: 1 }), done);
    });

    it.skip('iterate', function (done) {
      this.timeout(90 * 1e3);
      const iter = new Coroutine(function* () {
        while (true) {
          yield;
        }
      }, { size: 1 })[Symbol.asyncIterator]();
      benchmark('Coroutine iterate', () => void iter.next(), done);
    });

    it.skip('iterate async', function (done) {
      this.timeout(90 * 1e3);
      const iter = new Coroutine(async function* () {
        while (true) {
          yield;
        }
      }, { size: 1 })[Symbol.asyncIterator]();
      benchmark('Coroutine iterate async', () => void iter.next(), done);
    });

  });

});
