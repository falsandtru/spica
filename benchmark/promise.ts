import { benchmark } from './benchmark';
import { AtomicPromise } from '../';
import { Promise } from '../src/global';

describe('Benchmark:', function () {
  this.timeout(30 * 1e3);

  function chain(p: Promise<number>, n: number) {
    for (let i = 0; i < n; ++i) {
      p = p.then(n => n);
    }
    return p;
  }

  describe('AtomicPromise', function () {
    it('new', function (done) {
      benchmark('AtomicPromise new', () => void new AtomicPromise<number>(resolve => resolve(0)), done);
    });

    it('resolve', function (done) {
      benchmark('AtomicPromise resolve', () => void AtomicPromise.resolve(0), done);
    });

    it('then', function (done) {
      const p = AtomicPromise.resolve(0);
      benchmark(`AtomicPromise then`, () => void p.then(a => a), done);
    });

    it('chain 10', function (done) {
      const p = AtomicPromise.resolve(0);
      benchmark(`AtomicPromise chain 10`, () => void chain(p, 10), done);
    });

    it('chain 100', function (done) {
      const p = AtomicPromise.resolve(0);
      benchmark(`AtomicPromise chain 100`, () => void chain(p, 100), done);
    });

  });

  describe('Promise', function () {
    it('new', function (done) {
      benchmark('Promise new', () => void new Promise<number>(resolve => resolve(0)), done);
    });

    it('resolve', function (done) {
      benchmark('Promise resolve', () => void Promise.resolve(0), done);
    });

    it('then', function (done) {
      const p = Promise.resolve(0);
      benchmark(`Promise then`, done => void p.then(done), done, { defer: true, async: true });
    });

    it('chain 10', function (done) {
      const p = Promise.resolve(0);
      benchmark(`Promise chain 10`, done => void chain(p, 9).then(done), done, { defer: true, async: true });
    });

    it('chain 100', function (done) {
      const p = Promise.resolve(0);
      benchmark(`Promise chain 100`, done => void chain(p, 99).then(done), done, { defer: true, async: true });
    });

  });

});
