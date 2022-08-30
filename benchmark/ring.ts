import { benchmark } from './benchmark';
import { Ring } from '../src/ring';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('Ring', function () {
    afterEach(done => {
      setTimeout(done, 3000);
    });

    it('Ring new', function (done) {
      benchmark('Ring new', () => new Ring(), done);
    });

    for (const length of [1, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Array index ${length.toLocaleString('en')}`, function (done) {
        const data = Array();
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`Array index ${length.toLocaleString('en')}`, () => data[length - 1], done);
      });

      it(`Ring  index ${length.toLocaleString('en')}`, function (done) {
        const data = new Ring();
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`Ring  index ${length.toLocaleString('en')}`, () => data.at(length - 1), done);
      });
    }

    for (const length of [1, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Array set ${length.toLocaleString('en')}`, function (done) {
        const data = Array();
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`Array set ${length.toLocaleString('en')}`, () => data[length - 1] = 0, done);
      });

      it(`Ring  set ${length.toLocaleString('en')}`, function (done) {
        const data = new Ring();
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`Ring  set ${length.toLocaleString('en')}`, () => data.replace(length - 1, 0), done);
      });
    }

  });

});
