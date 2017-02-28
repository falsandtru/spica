import { benchmark } from './benchmark';
import { Supervisor } from '../';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('Supervisor', function () {
    it('cast', function (done) {
      const sv = new class extends Supervisor<string, number, void, void> { }();
      sv.register('', _ => [void 0, void 0], void 0);
      benchmark('Supervisor cast', () => sv.cast('', 0), done);
    });

    it('crash', function (done) {
      const sv = new class BenchSupervisor extends Supervisor<string, number, void, void> { }();
      benchmark('Supervisor crash', () => {
        sv.register('', (): any => { throw void 0 }, void 0);
        sv.cast('', 0);
      }, done);
    });

  });

});
