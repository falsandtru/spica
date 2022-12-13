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

    for (const size of [1, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(size.toLocaleString('en'), function (done) {
        benchmark(`Generator ${size.toLocaleString('en')}`, () => f(g(size)), done);
      });
    }
  });

});
