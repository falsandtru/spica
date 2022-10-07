import { benchmark } from './benchmark';
import Bluebird from 'bluebird';
import { AtomicPromise } from '../src/promise';
import { AtomicFuture, Future } from '../src/future';
import { clock } from '../src/clock';
import { noop } from '../src/function';

describe('Benchmark:', function () {
  Bluebird.config({
    longStackTraces: false,
  });

  describe('Promise', function () {
    it('Promise  resolve', function (done) {
      benchmark('Promise  resolve', () => void Promise.resolve(), done);
    });

    it('Bluebird resolve', function (done) {
      benchmark('Bluebird resolve', () => void Bluebird.resolve(), done);
    });

    it('APromise resolve', function (done) {
      benchmark('APromise resolve', () => void AtomicPromise.resolve(), done);
    });

    it('Promise  new', function (done) {
      benchmark('Promise  new', () => void new Promise(resolve => resolve(undefined)), done);
    });

    it('Bluebird new', function (done) {
      benchmark('Bluebird new', () => void new Bluebird(resolve => resolve()), done);
    });

    it('APromise new', function (done) {
      benchmark('APromise new', () => void new AtomicPromise(resolve => resolve(undefined)), done);
    });

    it('Future   new', function (done) {
      benchmark('Future   new', () => void new Future().bind(), done);
    });

    it('AFuture  new', function (done) {
      benchmark('AFuture  new', () => void new AtomicFuture().bind(), done);
    });

    it('Promise  then', function (done) {
      const p = Promise.resolve();
      benchmark('Promise  then', () => void p.then(noop), done);
    });

    it('Bluebird then', function (done) {
      const p = Bluebird.resolve();
      benchmark('Bluebird then', () => void p.then(noop), done);
    });

    it('APromise then', function (done) {
      const p = AtomicPromise.resolve();
      benchmark('APromise then', () => void p.then(noop), done);
    });

    it('Future   then', function (done) {
      const p = new Future().bind();
      benchmark('Future   then', () => void p.then(noop), done);
    });

    it('AFuture  then', function (done) {
      const p = new AtomicFuture().bind();
      benchmark('AFuture  then', () => void p.then(noop), done);
    });

    it('Promise  run', function (done) {
      benchmark('Promise  run', done => void new Promise(resolve => resolve(undefined)).then(done), done, { defer: true });
    });

    it('Bluebird run', function (done) {
      benchmark('Bluebird run', done => void new Bluebird(resolve => resolve()).then(done), done, { defer: true });
    });

    it('APromise run', function (done) {
      benchmark('APromise run', () => void new AtomicPromise(resolve => resolve(undefined)).then(noop), done);
    });

    it('Future   run', function (done) {
      benchmark('Future   run', done => void new Future().bind(undefined).then(done), done, { defer: true });
    });

    it('AFuture  run', function (done) {
      benchmark('AFuture  run', () => void new AtomicFuture().bind(undefined).then(noop), done);
    });

    it('Promise  run promise', function (done) {
      benchmark('Promise  run promise', done => void new Promise(resolve => resolve(clock)).then(done), done, { defer: true });
    });

    it('Bluebird run promise', function (done) {
      benchmark('Bluebird run promise', done => void new Bluebird(resolve => resolve(clock)).then(done), done, { defer: true });
    });

    it('APromise run promise', function (done) {
      benchmark('APromise run promise', done => void new AtomicPromise(resolve => resolve(clock)).then(done), done, { defer: true });
    });

    it('Future   run promise', function (done) {
      benchmark('Future   run promise', done => void new Future().bind(clock).then(done), done, { defer: true });
    });

    it('AFuture  run promise', function (done) {
      benchmark('AFuture  run promise', done => void new AtomicFuture().bind(clock).then(done), done, { defer: true });
    });

    it('Promise  all 2', function (done) {
      const ps = [
        Promise.resolve(),
        Promise.resolve(),
      ];
      benchmark('Promise  all 2', done => void Promise.all(ps).then(done), done, { defer: true });
    });

    it('Bluebird all 2', function (done) {
      const ps = [
        Bluebird.resolve(),
        Bluebird.resolve(),
      ];
      benchmark('Bluebird all 2', done => void Bluebird.all(ps).then(done), done, { defer: true });
    });

    it('APromise all 2', function (done) {
      const ps = [
        AtomicPromise.resolve(),
        AtomicPromise.resolve(),
      ];
      benchmark('APromise all 2', () => void AtomicPromise.all(ps).then(noop), done);
    });

    it('Promise  all 3', function (done) {
      const ps = [
        Promise.resolve(),
        Promise.resolve(),
        Promise.resolve(),
      ];
      benchmark('Promise  all 3', done => void Promise.all(ps).then(done), done, { defer: true });
    });

    it('Bluebird all 3', function (done) {
      const ps = [
        Bluebird.resolve(),
        Bluebird.resolve(),
        Bluebird.resolve(),
      ];
      benchmark('Bluebird all 3', done => void Bluebird.all(ps).then(done), done, { defer: true });
    });

    it('APromise all 3', function (done) {
      const ps = [
        AtomicPromise.resolve(),
        AtomicPromise.resolve(),
        AtomicPromise.resolve(),
      ];
      benchmark('APromise all 3', () => void AtomicPromise.all(ps).then(noop), done);
    });

    it('Promise  race 2', function (done) {
      const ps = [
        new Promise(() => 0),
        Promise.resolve(),
      ];
      benchmark('Promise  race 2', done => void Promise.race(ps).then(done), done, { defer: true });
    });

    it('Bluebird race 2', function (done) {
      const ps = [
        new Bluebird(() => 0),
        Bluebird.resolve(),
      ];
      benchmark('Bluebird race 2', done => void Bluebird.race(ps).then(done), done, { defer: true });
    });

    it('APromise race 2', function (done) {
      const ps = [
        new AtomicPromise(() => 0),
        AtomicPromise.resolve(),
      ];
      benchmark('APromise race 2', () => void AtomicPromise.race(ps).then(noop), done);
    });

    it('Promise  race 3', function (done) {
      const ps = [
        new Promise(resolve => clock.then(resolve)),
        Promise.resolve(),
        new Promise(() => 0),
      ];
      benchmark('Promise  race 3', done => void Promise.race(ps).then(done), done, { defer: true });
    });

    it('Bluebird race 3', function (done) {
      const ps = [
        new Bluebird(resolve => clock.then(resolve)),
        Bluebird.resolve(),
        new Bluebird(() => 0),
      ];
      benchmark('Bluebird race 3', done => void Bluebird.race(ps).then(done), done, { defer: true });
    });

    it('APromise race 3', function (done) {
      const ps = [
        new AtomicPromise(resolve => clock.then(resolve)),
        AtomicPromise.resolve(),
        new AtomicPromise(() => 0),
      ];
      benchmark('APromise race 3', () => void AtomicPromise.race(ps).then(noop), done);
    });

  });

});
