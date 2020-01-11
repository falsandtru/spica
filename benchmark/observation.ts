import { benchmark } from './benchmark';
import { Observation } from '../';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  function noop(): unknown {
    return;
  }

  describe('Observation', function () {
    it('monitor', function (done) {
      const subject = new Observation();
      subject.monitor([], () => 0);
      benchmark('Observation monitor', () => subject.emit([], 0), done);
    });

    it('on', function (done) {
      const subject = new Observation();
      subject.on([], () => 0);
      benchmark('Observation on', () => subject.emit([], 0), done);
    });

    it('reflect', function (done) {
      const subject = new Observation();
      subject.on([], () => 0);
      benchmark('Observation reflect', () => subject.reflect([], 0), done);
    });

    it('reflect 10', function (done) {
      const subject = new Observation();
      for (let i = 0; i < 1e1; ++i) {
        subject.on([i], () => 0);
      }
      benchmark('Observation reflect 10', () => subject.reflect([], 0), done);
    });

    it('reflect 100', function (done) {
      const subject = new Observation();
      for (let i = 0; i < 1e2; ++i) {
        subject.on([i], () => 0);
      }
      benchmark('Observation reflect 100', () => subject.reflect([], 0), done);
    });

    it('monitor and on', function (done) {
      const subject = new Observation();
      subject.monitor([], () => 0);
      subject.on([], () => 0);
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
      subject.on(['bench'], () => 0);
      benchmark('Observation on with namespace', () => subject.emit(['bench'], 0), done);
    });

    it('once with namespace', function (done) {
      const subject = new Observation();
      benchmark('Observation once with namespace', () => {
        subject.once(['bench'], noop);
        subject.emit([], 0);
      }, done);
    });

  });

});
