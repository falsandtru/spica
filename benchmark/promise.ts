import { benchmark } from './benchmark';
import { AtomicPromise } from '../';
import { Promise } from '../src/global';
import { noop } from '../src/noop';

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

    it('all 2', function (done) {
      const ps = [
        AtomicPromise.resolve(0),
        AtomicPromise.resolve(0),
      ];
      benchmark(`AtomicPromise all 2`, () => void AtomicPromise.all(ps).then(noop), done);
    });

    it('all 3', function (done) {
      const ps = [
        AtomicPromise.resolve(0),
        AtomicPromise.resolve(0),
        AtomicPromise.resolve(0),
      ];
      benchmark(`AtomicPromise all 3`, () => void AtomicPromise.all(ps).then(noop), done);
    });

    it('race 2', function (done) {
      const ps = [
        new AtomicPromise(() => 0),
        AtomicPromise.resolve(0),
      ];
      benchmark(`AtomicPromise race 2`, () => void AtomicPromise.race(ps).then(noop), done);
    });

    it('race 3', function (done) {
      const ps = [
        new AtomicPromise(() => 0),
        AtomicPromise.resolve(0),
        new AtomicPromise(() => 0),
      ];
      benchmark(`AtomicPromise race 3`, () => void AtomicPromise.race(ps).then(noop), done);
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

    it('all 2', function (done) {
      const ps = [
        Promise.resolve(0),
        Promise.resolve(0),
      ];
      benchmark(`Promise all 2`, done => void Promise.all(ps).then(done), done, { defer: true, async: true });
    });

    it('all 3', function (done) {
      const ps = [
        Promise.resolve(0),
        Promise.resolve(0),
        Promise.resolve(0),
      ];
      benchmark(`Promise all 3`, done => void Promise.all(ps).then(done), done, { defer: true, async: true });
    });

    it('race 2', function (done) {
      const ps = [
        new Promise(() => 0),
        Promise.resolve(0),
      ];
      benchmark(`Promise race 2`, done => void Promise.race(ps).then(done), done, { defer: true, async: true });
    });

    it('race 3', function (done) {
      const ps = [
        new Promise(() => 0),
        Promise.resolve(0),
        new Promise(() => 0),
      ];
      benchmark(`Promise race 3`, done => void Promise.race(ps).then(done), done, { defer: true, async: true });
    });

  });

});
