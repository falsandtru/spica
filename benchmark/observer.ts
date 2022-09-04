import { benchmark } from './benchmark';
import { Observation } from '../src/observer';

describe('Benchmark:', function () {
  function noop(): unknown {
    return;
  }

  describe('Observation', function () {
    it('new', function (done) {
      benchmark('Observation new', () => new Observation(), done);
    });

    it('monitor', function (done) {
      const subject = new Observation();
      subject.monitor([], noop);
      benchmark('Observation monitor', () => subject.emit([], 0), done);
    });

    it('monitor 10', function (done) {
      const subject = new Observation();
      for (let i = 0; i < 1e1; ++i) {
        subject.monitor([i], noop);
      }
      benchmark('Observation monitor 10', () => subject.emit([], 0), done);
    });

    it('monitor 100', function (done) {
      const subject = new Observation();
      for (let i = 0; i < 1e2; ++i) {
        subject.monitor([i], noop);
      }
      benchmark('Observation monitor 100', () => subject.emit([], 0), done);
    });

    it('on', function (done) {
      const subject = new Observation();
      subject.on([], noop);
      benchmark('Observation on', () => subject.emit([], 0), done);
    });

    it('on 10', function (done) {
      const subject = new Observation();
      for (let i = 0; i < 1e1; ++i) {
        subject.on([i], noop);
      }
      benchmark('Observation on 10', () => subject.emit([], 0), done);
    });

    it('on 100', function (done) {
      const subject = new Observation();
      for (let i = 0; i < 1e2; ++i) {
        subject.on([i], noop);
      }
      benchmark('Observation on 100', () => subject.emit([], 0), done);
    });

    it('reflect', function (done) {
      const subject = new Observation();
      subject.on([], noop);
      benchmark('Observation reflect', () => subject.reflect([], 0), done);
    });

    it('reflect 10', function (done) {
      const subject = new Observation();
      for (let i = 0; i < 1e1; ++i) {
        subject.on([i], noop);
      }
      benchmark('Observation reflect 10', () => subject.reflect([], 0), done);
    });

    it('reflect 100', function (done) {
      const subject = new Observation();
      for (let i = 0; i < 1e2; ++i) {
        subject.on([i], noop);
      }
      benchmark('Observation reflect 100', () => subject.reflect([], 0), done);
    });

    it('monitor and on', function (done) {
      const subject = new Observation();
      subject.monitor([], noop);
      subject.on([], noop);
      benchmark('Observation monitor and on', () => subject.emit([], 0), done);
    });

    it('once', function (done) {
      const subject = new Observation();
      benchmark('Observation once', () => {
        subject.once([], noop);
        subject.emit([], 0);
      }, done);
    });

    it('on with namespace', function (done) {
      const subject = new Observation();
      subject.on(['bench'], noop);
      benchmark('Observation on with namespace', () => subject.emit(['bench'], 0), done);
    });

    it('once with namespace', function (done) {
      const subject = new Observation();
      benchmark('Observation once with namespace', () => {
        subject.once(['bench'], noop);
        subject.emit(['bench'], 0);
      }, done);
    });

  });

});
