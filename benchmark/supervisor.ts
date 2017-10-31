import { benchmark } from './benchmark';
import { Supervisor } from '../';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('Supervisor', function () {
    it('cast', function (done) {
      const sv = new class extends Supervisor<string, number> { }();
      sv.register('', _ => [undefined, undefined], undefined);
      benchmark('Supervisor cast', () => sv.cast('', 0), done);
    });

  });

});
