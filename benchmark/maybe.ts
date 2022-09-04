import { benchmark } from './benchmark';
import { Maybe, Just } from '../src/maybe';

describe('Benchmark:', function () {
  describe('Maybe', function () {
    it('Just', function (done) {
      benchmark('Maybe Just', () => Just(0), done);
    });

    function bind(m: Maybe<number>, n: number) {
      for (let i = 0; i < n; ++i) {
        m = m.bind(n => Just(n));
      }
      m.extract();
    }
    it('bind 1', function (done) {
      const maybe = Just(0);
      benchmark(`Maybe bind 1`, () => bind(maybe, 1), done);
    });

    it('bind 10', function (done) {
      const maybe = Just(0);
      benchmark(`Maybe bind 10`, () => bind(maybe, 10), done);
    });

    it('bind 100', function (done) {
      const maybe = Just(0);
      benchmark(`Maybe bind 100`, () => bind(maybe, 100), done);
    });

  });

});
