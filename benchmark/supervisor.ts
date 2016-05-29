import {benchmark} from './benchmark';
import {Supervisor} from 'spica';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('Supervisor', function () {
    it('cast', function (done) {
      const sv = new class extends Supervisor<string[], number, void> { }();
      sv.register([], _ => void 0);
      benchmark('Supervisor cast', () => sv.cast([], 0), done);
    });

    it('namespace', function (done) {
      const sv = new class extends Supervisor<string[], number, void> { }();
      sv.register([''], _ => void 0);
      benchmark('Supervisor namespace', () => sv.cast([''], 0), done);
    });

    it('dependencies', function (done) {
      const sv = new class extends Supervisor<string[], number, void> { }({
        dependencies: [
          [[], [
            ['']
          ]],
          [[''], [
            []
          ]]
        ]
      });
      sv.register([], _ => void 0);
      sv.register([''], _ => void 0);
      benchmark('Supervisor dependencies', () => sv.cast([], 0), done);
    });

    it('crash', function (done) {
      const sv = new class BenchSupervisor extends Supervisor<string[], number, void> { }();
      benchmark('Supervisor crash', () => {
        sv.register([], (): any => { throw void 0 });
        sv.cast([], 0);
      }, done);
    });

    it('process 10', function (done) {
      const sv = new class BenchSupervisor extends Supervisor<string[], number, void> { }();
      for (let i = 1e1; i; --i) {
        sv.register([i + ''], _ => void 0);
      }
      benchmark('Supervisor process 10', () => sv.cast([], 0), done);
    });

    it('process 100', function (done) {
      const sv = new class BenchSupervisor extends Supervisor<string[], number, void> { }();
      for (let i = 1e2; i; --i) {
        sv.register([i + ''], _ => void 0);
      }
      benchmark('Supervisor process 100', () => sv.cast([], 0), done);
    });

  });

});
