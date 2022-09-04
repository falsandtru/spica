import { benchmark } from './benchmark';
import { Either, Right } from '../src/either';

describe('Benchmark:', function () {
  describe('Either', function () {
    it('Right', function (done) {
      benchmark('Either Right', () => Right(0), done);
    });

    function bind(m: Either<void, number>, n: number) {
      for (let i = 0; i < n; ++i) {
        m = m.bind(n => Right(n));
      }
      m.extract();
    }
    it('bind 1', function (done) {
      const either = Right(0);
      benchmark(`Either bind 1`, () => bind(either, 1), done);
    });

    it('bind 10', function (done) {
      const either = Right(0);
      benchmark(`Either bind 10`, () => bind(either, 10), done);
    });

    it('bind 100', function (done) {
      const either = Right(0);
      benchmark(`Either bind 100`, () => bind(either, 100), done);
    });

  });

});
