import {benchmark} from './benchmark';
import {IContextDefinition} from 'mocha';
import {Observable} from 'spica';

describe('Benchmark:', function (this: IContextDefinition) {
  this.timeout(10 * 1e3);

  function noop(): any {
  }

  describe('Observable', function () {
    it('equal', function (done) {
      const [a, b] = [[0, 1], [0, 1]];
      benchmark('Observable equal', () => equal(a, b), done);

      function equal<T>(a: T[], b: T[]): boolean {
        if (a === b) return true;
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; ++i) {
          if (a[i] !== b[i]) return false;
        }
        return true;
      }
    });

    it('monitor', function (done) {
      const subject = new Observable();
      subject.monitor([], _ => 0);
      benchmark('Observable monitor', () => subject.emit([], 0), done);
    });

    it('on', function (done) {
      const subject = new Observable();
      subject.on([], _ => 0);
      benchmark('Observable on', () => subject.emit([], 0), done);
    });

    it('reflect', function (done) {
      const subject = new Observable();
      subject.on([], _ => 0);
      benchmark('Observable reflect', () => subject.reflect([], 0), done);
    });

    it('reflect 10', function (done) {
      const subject = new Observable();
      for (let i = 0; i < 1e1; ++i) {
        subject.on([i], _ => 0);
      }
      benchmark('Observable reflect 10', () => subject.reflect([], 0), done);
    });

    it('reflect 100', function (done) {
      const subject = new Observable();
      for (let i = 0; i < 1e2; ++i) {
        subject.on([i], _ => 0);
      }
      benchmark('Observable reflect 100', () => subject.reflect([], 0), done);
    });

    it('monitor and on', function (done) {
      const subject = new Observable();
      subject.monitor([], _ => 0);
      subject.on([], _ => 0);
      benchmark('Observable monitor and on', () => subject.emit([], 0), done);
    });

    it('once', function (done) {
      const subject = new Observable();
      benchmark('Observable once', () => {
        subject.once([], noop);
        subject.emit([], 0);
      }, done);
    });

    it('on with namespace', function (done) {
      const subject = new Observable();
      subject.on(['bench'], _ => 0);
      benchmark('Observable on with namespace', () => subject.emit(['bench'], 0), done);
    });

    it('once with namespace', function (done) {
      const subject = new Observable();
      benchmark('Observable once with namespace', () => {
        subject.once(['bench'], noop);
        subject.emit([], 0);
      }, done);
    });

  });

});
