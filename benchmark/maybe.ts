import {benchmark} from './benchmark';
import {Maybe, Just} from 'spica';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('Maybe', function () {
    it('Just', function (done) {
      benchmark('Maybe Just', () => Just(0), done);
    });

    function bind(n: number, done: () => void) {
      benchmark(`Maybe bind ${n}`, () => {
        let maybe: Maybe<number> = Just(0);
        for (let i = 0; i < n; ++i) {
          maybe = maybe.bind(n => Just(n));
        }
        maybe.extract();
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
