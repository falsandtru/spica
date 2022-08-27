import { benchmark } from './benchmark';
import { Stack } from '../src/stack';
import { Queue } from '../src/queue';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('abstract', function () {
    afterEach(done => {
      setTimeout(done, 1000);
    });

    for (const length of [1, 10, 100, 1000, 10000, 100000, 1000000]) {
      it(`array head ${length.toLocaleString('en')}`, function (done) {
        const data: unknown[] = [];
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`abstract array head ${length.toLocaleString('en')}`, () => (data.shift(), data.unshift(0)), done);
      });

      it(`array stack ${length.toLocaleString('en')}`, function (done) {
        const data: unknown[] = [];
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`abstract array stack ${length.toLocaleString('en')}`, () => (data.pop(), data.push(0)), done);
      });

      it(`array queue ${length.toLocaleString('en')}`, function (done) {
        const data: unknown[] = [];
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`abstract array queue ${length.toLocaleString('en')}`, () => (data.shift(), data.push(0)), done);
      });

      it(`stack ${length.toLocaleString('en')}`, function (done) {
        const data = new Stack();
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`abstract stack ${length.toLocaleString('en')}`, () => (data.pop(), data.push(0)), done);
      });

      it(`queue ${length.toLocaleString('en')}`, function (done) {
        const data = new Queue();
        for (let i = 0; i < length; ++i) data.enqueue(0);
        benchmark(`abstract queue ${length.toLocaleString('en')}`, () => (data.dequeue(), data.enqueue(0)), done);
      });
    }

  });

});
