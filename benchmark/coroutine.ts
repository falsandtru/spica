import { benchmark } from './benchmark';
import { Coroutine } from '..';
import { AtomicPromise } from '..';

describe('Benchmark:', function () {
  this.timeout(30 * 1e3);
  afterEach(() => new AtomicPromise(requestAnimationFrame));

  describe('Coroutine', function () {
    it('new', function (done) {
      benchmark('Coroutine new', () => void new Coroutine(async function* () { }, { sendBufferSize: 1, autorun: false }), done);
    });

    it('run', function (done) {
      this.timeout(90 * 1e3);
      benchmark('Coroutine run', done => void new Coroutine(async function* () { }, { sendBufferSize: 1, debug: true }).then(done), done, { defer: true, async: true });
    });

    it('iterate', function (done) {
      this.timeout(90 * 1e3);
      const port = new Coroutine(async function* () {
        while (true) {
          yield;
        }
      }, { sendBufferSize: 1, autorun: false })[Coroutine.port];
      benchmark('Coroutine iterate', done => void port.send(0).then(done), done, { defer: true, async: true });
    });

  });

});
