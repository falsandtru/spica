import { benchmark } from './benchmark';
import { URL } from '..';
import { global } from '../src/global';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('URL', function () {
    it('native', function (done) {
      benchmark('URL native', () => new global.URL('', location.href), done);
    });

    it('custom', function (done) {
      benchmark('URL custom', () => new URL(''), done);
    });

  });

});
