import { benchmark } from './benchmark';
import { URL } from '..';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('URL', function () {
    it('native', function (done) {
      benchmark('URL native', () => new self.URL('', location.href), done);
    });

    it('custom', function (done) {
      benchmark('URL custom', () => new URL(''), done);
    });

  });

});
