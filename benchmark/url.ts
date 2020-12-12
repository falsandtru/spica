import { benchmark } from './benchmark';
import { ReadonlyURL, URL } from '..';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);
  const { origin } = location;

  describe('URL', function () {
    describe('native', function () {
      const url = new global.URL('', origin);

      it('new', function (done) {
        benchmark('URL native new', () => new global.URL('', origin), done);
      });

      it('href', function (done) {
        benchmark('URL native href', () => url.href, done);
      });

      it('origin', function (done) {
        benchmark('URL native origin', () => url.origin, done);
      });

    });

    describe('readonly', function () {
      const url = new ReadonlyURL('', origin);

      it('new', function (done) {
        benchmark('URL readonly new', () => new ReadonlyURL('', origin), done);
      });

      it('href', function (done) {
        benchmark('URL readonly href', () => url.href, done);
      });

      it('origin', function (done) {
        benchmark('URL readonly origin', () => url.origin, done);
      });

    });

    describe('custom', function () {
      const url = new URL('', origin);

      it('new', function (done) {
        benchmark('URL custom new', () => new URL('', origin), done);
      });

      it('href', function (done) {
        benchmark('URL custom href', () => url.href, done);
      });

      it('origin', function (done) {
        benchmark('URL custom origin', () => url.origin, done);
      });

    });

  });

});
