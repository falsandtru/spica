import { benchmark } from './benchmark';
import { Stack } from '../src/stack';
import { Queue } from '../src/queue';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('data', function () {
    afterEach(done => {
      setTimeout(done, 1000);
    });

    it('Stack new', function (done) {
      benchmark('Stack new', () => new Stack(), done);
    });

    it('Queue new', function (done) {
      benchmark('Queue new', () => new Queue(), done);
    });

    for (const length of [1, 10, 100, 1000, 10000, 100000, 1000000]) {
      it(`Array first ${length.toLocaleString('en')}`, function (done) {
        const data: unknown[] = [];
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`Array first ${length.toLocaleString('en')}`, () => (data.shift(), data.unshift(0)), done);
      });

      it(`Array stack ${length.toLocaleString('en')}`, function (done) {
        const data: unknown[] = [];
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`Array stack ${length.toLocaleString('en')}`, () => (data.pop(), data.push(0)), done);
      });

      it(`Array queue ${length.toLocaleString('en')}`, function (done) {
        const data: unknown[] = [];
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`Array queue ${length.toLocaleString('en')}`, () => (data.shift(), data.push(0)), done);
      });

      it(`Stack ${length.toLocaleString('en')}`, function (done) {
        const data = new Stack();
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`Stack ${length.toLocaleString('en')}`, () => (data.pop(), data.push(0)), done);
      });

      it(`Queue ${length.toLocaleString('en')}`, function (done) {
        const data = new Queue();
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`Queue ${length.toLocaleString('en')}`, () => (data.pop(), data.push(0)), done);
      });
    }

  });

});
