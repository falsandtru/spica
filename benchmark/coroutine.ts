import { benchmark } from './benchmark';
import { Coroutine } from '..';
import { AtomicPromise } from '..';

describe('Benchmark:', function () {
  this.timeout(30 * 1e3);
  afterEach(() => new AtomicPromise(requestAnimationFrame));

  describe('Coroutine', function () {
    it('new', function (done) {
      benchmark('Coroutine new', () => new Coroutine(async function* () { }, { size: 1 }), done);
    });

    it('iterate', function (done) {
      this.timeout(90 * 1e3);
      const port = new Coroutine(async function* () {
        while (true) {
          yield;
        }
      }, { size: 1 })[Coroutine.port];
      benchmark('Coroutine iterate', done => void port.send(0).then(done), done, { defer: true, async: true });
    });

  });

});
