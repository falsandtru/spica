import { benchmark } from './benchmark';
import { Promise } from '../src/global';
import { AtomicPromise } from '../src/promise';
import Bluebird from 'bluebird';
import { clock } from '../src/clock';
import { noop } from '../src/function';

describe('Benchmark:', function () {
  Bluebird.config({
    longStackTraces: false,
  });

  function chain(p: Promise<unknown>, n: number) {
    for (let i = 0; i < n; ++i) {
      p = p.then(n => n);
    }
    return p;
  }

  describe('Promise', function () {
    it('resolve', function (done) {
      benchmark('Promise  resolve', () => void Promise.resolve(), done);
    });

    it('resolve', function (done) {
      benchmark('APromise resolve', () => void AtomicPromise.resolve(), done);
    });

    it('resolve', function (done) {
      benchmark('Bluebird resolve', () => void Bluebird.resolve(), done);
    });

    it('new', function (done) {
      benchmark('Promise  new', () => void new Promise(resolve => resolve(void 0)), done);
    });

    it('new', function (done) {
      benchmark('APromise new', () => void new AtomicPromise(resolve => resolve(void 0)), done);
    });

    it('new', function (done) {
      benchmark('Bluebird new', () => void new Bluebird(resolve => resolve()), done);
    });

    it('run', function (done) {
      benchmark('Promise  run', done => void new Promise(resolve => clock.then(resolve)).then(done), done, { defer: true });
    });

    it('run', function (done) {
      benchmark('APromise run', done => void new AtomicPromise(resolve => clock.then(resolve)).then(done), done, { defer: true });
    });

    it('run', function (done) {
      benchmark('Bluebird run', done => void new Bluebird(resolve => clock.then(resolve)).then(done), done, { defer: true });
    });

    it('then', function (done) {
      const p = Promise.resolve();
      benchmark('Promise  then', done => void p.then(done), done, { defer: true });
    });

    it('then', function (done) {
      const p = AtomicPromise.resolve();
      benchmark('APromise then', () => void p.then(noop), done);
    });

    it('then', function (done) {
      const p = Bluebird.resolve();
      benchmark('Bluebird then', done => void p.then(done), done, { defer: true });
    });

    it('chain 10', function (done) {
      const p = Promise.resolve();
      benchmark('Promise  chain 10', done => void chain(p, 9).then(done), done, { defer: true });
    });

    it('chain 10', function (done) {
      const p = AtomicPromise.resolve();
      benchmark('APromise chain 10', () => void chain(p, 10), done);
    });

    it('chain 10', function (done) {
      const p = Bluebird.resolve();
      benchmark('Bluebird chain 10', done => void chain(p, 9).then(done), done, { defer: true });
    });

    it('chain 100', function (done) {
      const p = Promise.resolve();
      benchmark('Promise  chain 100', done => void chain(p, 99).then(done), done, { defer: true });
    });

    it('chain 100', function (done) {
      const p = AtomicPromise.resolve();
      benchmark('APromise chain 100', () => void chain(p, 100), done);
    });

    it('chain 100', function (done) {
      const p = Bluebird.resolve();
      benchmark('Bluebird chain 100', done => void chain(p, 99).then(done), done, { defer: true });
    });

    it('all 2', function (done) {
      const ps = [
        Promise.resolve(),
        Promise.resolve(),
      ];
      benchmark('Promise  all 2', done => void Promise.all(ps).then(done), done, { defer: true });
    });

    it('all 2', function (done) {
      const ps = [
        AtomicPromise.resolve(),
        AtomicPromise.resolve(),
      ];
      benchmark('APromise all 2', () => void AtomicPromise.all(ps).then(noop), done);
    });

    it('all 2', function (done) {
      const ps = [
        Bluebird.resolve(),
        Bluebird.resolve(),
      ];
      benchmark('Bluebird all 2', done => void Bluebird.all(ps).then(done), done, { defer: true });
    });

    it('all 3', function (done) {
      const ps = [
        Promise.resolve(),
        Promise.resolve(),
        Promise.resolve(),
      ];
      benchmark('Promise  all 3', done => void Promise.all(ps).then(done), done, { defer: true });
    });

    it('all 3', function (done) {
      const ps = [
        AtomicPromise.resolve(),
        AtomicPromise.resolve(),
        AtomicPromise.resolve(),
      ];
      benchmark('APromise all 3', () => void AtomicPromise.all(ps).then(noop), done);
    });

    it('all 3', function (done) {
      const ps = [
        Bluebird.resolve(),
        Bluebird.resolve(),
        Bluebird.resolve(),
      ];
      benchmark('Bluebird all 3', done => void Bluebird.all(ps).then(done), done, { defer: true });
    });

    it('race 2', function (done) {
      const ps = [
        new Promise(() => 0),
        Promise.resolve(),
      ];
      benchmark('Promise  race 2', done => void Promise.race(ps).then(done), done, { defer: true });
    });

    it('race 2', function (done) {
      const ps = [
        new AtomicPromise(() => 0),
        AtomicPromise.resolve(),
      ];
      benchmark('APromise race 2', () => void AtomicPromise.race(ps).then(noop), done);
    });

    it('race 2', function (done) {
      const ps = [
        new Bluebird(() => 0),
        Bluebird.resolve(),
      ];
      benchmark('Bluebird race 2', done => void Bluebird.race(ps).then(done), done, { defer: true });
    });

    it('race 3', function (done) {
      const ps = [
        new Promise(resolve => clock.then(resolve)),
        Promise.resolve(),
        new Promise(() => 0),
      ];
      benchmark('Promise  race 3', done => void Promise.race(ps).then(done), done, { defer: true });
    });

    it('race 3', function (done) {
      const ps = [
        new AtomicPromise(resolve => clock.then(resolve)),
        AtomicPromise.resolve(),
        new AtomicPromise(() => 0),
      ];
      benchmark('APromise race 3', () => void AtomicPromise.race(ps).then(noop), done);
    });

    it('race 3', function (done) {
      const ps = [
        new Bluebird(resolve => clock.then(resolve)),
        Bluebird.resolve(),
        new Bluebird(() => 0),
      ];
      benchmark('Bluebird race 3', done => void Bluebird.race(ps).then(done), done, { defer: true });
    });

  });

});
