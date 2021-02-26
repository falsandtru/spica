import { benchmark } from './benchmark';
import { Coroutine } from '..';
import { AtomicPromise } from '..';

describe('Benchmark:', function () {
  this.timeout(30 * 1e3);
  afterEach(() => new AtomicPromise(requestAnimationFrame));

  describe('Asyncgenerator', function () {
    it('iterate ', function (done) {
      const iter = async function* () {
        while (true) yield;
      }()[Symbol.asyncIterator]();
      benchmark('Asyncgenerator iterate', done => void iter.next().then(done), done, { defer: true, async: true });
    });

  });

  describe('Coroutine', function () {
    it('new', function (done) {
      benchmark('Coroutine new', () => void new Coroutine(async function* () { }, { capacity: 0, run: false }), done);
    });

    it('run', function (done) {
      this.timeout(90 * 1e3);
      benchmark('Coroutine run', done => void new Coroutine(async function* () { }, { capacity: 0, delay: false }).then(done), done, { defer: true, async: true });
    });

    it('ask', function (done) {
      this.timeout(90 * 1e3);
      const port = new Coroutine(async function* () {
        while (true) yield;
      }, { capacity: 0, delay: false })[Coroutine.port];
      benchmark('Coroutine ask', done => void port.ask(0).then(done), done, { defer: true, async: true });
    });

  });

});
