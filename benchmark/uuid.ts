import { benchmark } from './benchmark';
import { uuid } from '../';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('uuid', function () {
    it('gen', function (done) {
      benchmark('uuid gen', uuid, done);
    });

  });

});
