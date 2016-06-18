import {benchmark} from './benchmark';
import {sort} from 'spica';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('sort', function () {
    this.timeout(100 * 1e3);

    function array(n: number) {
      return (<void[]>Array.apply([], Array(n))).map((_, i) => i);
    }

    function bench(n: number) {
      return Promise.resolve()
        .then(() => new Promise(resolve => native(array(n), resolve)))
        .then(() => new Promise(resolve => partial(array(n), resolve)));
    }
    function native(arr: number[], done: () => void) {
      benchmark(`sort native ${arr.length}`, () => arr.sort(), done);
    }
    function partial(arr: number[], done: () => void) {
      function cmp(a: number, b: number): number {
        return a - b;
      }
      benchmark(`sort partial ${arr.length}`, () => sort(arr, cmp, 1), done);
    }

    it('sort 10', function (done) {
      bench(10).then(() => done());
    });

    it('sort 100', function (done) {
      bench(100).then(() => done());
    });

    it('sort 1000', function (done) {
      bench(1000).then(() => done());
    });

  });

});
