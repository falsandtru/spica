import { benchmark } from './benchmark';
import { Supervisor } from '../';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('Supervisor', function () {
    it('new', function (done) {
      class SV extends Supervisor<string, number> {
      }
      benchmark('Supervisor new', () => new SV(), done);
    });

    it('cast', function (done) {
      const sv = new class extends Supervisor<string, number> { }();
      sv.register('', n => [n, undefined], undefined);
      benchmark('Supervisor cast', () => sv.cast('', 0), done);
    });

  });

});
