import { benchmark } from './benchmark';

describe('Benchmark:', function () {
  describe('Generator', function () {
    function f(as: Iterable<any>) {
      for (const a of as) a;
    }
    function* g(len: number) {
      for (let i = 0; i < len; ++i) {
        yield i;
      }
    }

    for (const length of [1, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(length.toLocaleString('en'), function (done) {
        benchmark(`Generator ${length.toLocaleString('en')}`, () => f(g(length)), done);
      });
    }
  });

});
