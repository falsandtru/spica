import { benchmark } from './benchmark';
import { Supervisor } from '../';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('Supervisor', function () {
    it('new', function (done) {
      class SV extends Supervisor<string, number> {
      }
      benchmark('Supervisor new', () => new SV().terminate(), done);
    });

    it('cast', function (done) {
      const sv = new class extends Supervisor<string, number> { }();
      sv.register('', n => [n, void 0], void 0);
      benchmark('Supervisor cast', () => sv.cast('', 0), done);
    });

    it('call', function (done) {
      const sv = new class extends Supervisor<string, number> { }();
      sv.register('', n => [n, void 0], void 0);
      benchmark('Supervisor call', done => sv.call('', 0, done), done, { defer: true, async: true });
    });

  });

});
