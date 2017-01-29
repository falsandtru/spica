import { benchmark } from './benchmark';
import { Either, Right } from '../spica';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('Either', function () {
    it('Right', function (done) {
      benchmark('Either Right', () => Right(0), done);
    });

    function bind(n: number, done: () => void) {
      benchmark(`Either bind ${n}`, () => {
        let either: Either<void, number> = Right(0);
        for (let i = 0; i < n; ++i) {
          either = either.bind(n => Right(n));
        }
        either.extract();
      }, done);
    }
    it('bind 1', function (done) {
      bind(1, done);
    });

    it('bind 10', function (done) {
      bind(10, done);
    });

    it('bind 100', function (done) {
      bind(100, done);
    });

  });

});
