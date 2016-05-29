import {benchmark} from './benchmark';
import {Right} from 'spica';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('Either', function () {
    it('Right', function (done) {
      benchmark('Either Right', () => Right(0), done);
    });

    it('bind', function (done) {
      const right = Right(0);
      benchmark('Either bind', () => right.bind(n => Right(n)).extract(), done);
    });

  });

});
