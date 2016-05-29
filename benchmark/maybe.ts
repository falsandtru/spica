import {benchmark} from './benchmark';
import {Just} from 'spica';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('Maybe', function () {
    it('Just', function (done) {
      benchmark('Maybe Just', () => Just(0), done);
    });

    it('bind', function (done) {
      const just = Just(0);
      benchmark('Maybe bind', () => just.bind(n => Just(n)).extract(), done);
    });

  });

});
