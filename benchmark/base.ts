import { benchmark } from './benchmark';
import { Ring } from '../src/ring';
import { Stack } from '../src/stack';
import { Queue, PriorityQueue } from '../src/queue';

describe('Benchmark:', function () {
  describe('base', function () {
    it('Ring  new', function (done) {
      benchmark('Ring  new', () => new Ring(), done);
    });

    it('Stack new', function (done) {
      benchmark('Stack new', () => new Stack(), done);
    });

    it('Queue new', function (done) {
      benchmark('Queue new', () => new Queue(), done);
    });

    it('PQueue new', function (done) {
      benchmark('PQueue new', () => new PriorityQueue(), done);
    });

    for (const length of [1, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
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

      it(`Ring  queue ${length.toLocaleString('en')}`, function (done) {
        const data = new Ring();
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`Ring  queue ${length.toLocaleString('en')}`, () => (data.shift(), data.push(0)), done);
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

      it(`PQueue ${length.toLocaleString('en')}`, function (done) {
        const data = new PriorityQueue();
        for (let i = 0; i < length; ++i) data.push(0, 0);
        benchmark(`PQueue ${length.toLocaleString('en')}`, () => (data.pop(), data.push(0, 0)), done);
      });
    }

    for (const length of [1, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Array index ${length.toLocaleString('en')}`, function (done) {
        const data = Array();
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`Array index ${length.toLocaleString('en')}`, () => data[length - 1], done);
      });

      it(`Ring  index ${length.toLocaleString('en')}`, function (done) {
        const data = new Ring();
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`Ring  index ${length.toLocaleString('en')}`, () => data.at(-1), done);
      });

      it(`Stack index ${length.toLocaleString('en')}`, function (done) {
        const data = new Stack();
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`Stack index ${length.toLocaleString('en')}`, () => data.peek(), done);
      });

      it(`Queue index ${length.toLocaleString('en')}`, function (done) {
        const data = new Queue();
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`Queue index ${length.toLocaleString('en')}`, () => data.peek(), done);
      });

      it(`PQueue index ${length.toLocaleString('en')}`, function (done) {
        const data = new PriorityQueue();
        for (let i = 0; i < length; ++i) data.push(0, 0);
        benchmark(`PQueue index ${length.toLocaleString('en')}`, () => data.peek(), done);
      });
    }

    for (const length of [1, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Array set ${length.toLocaleString('en')}`, function (done) {
        const data = Array();
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`Array set ${length.toLocaleString('en')}`, () => data[length - 1] = 0, done);
      });

      it(`Ring  set ${length.toLocaleString('en')}`, function (done) {
        const data = new Ring();
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`Ring  set ${length.toLocaleString('en')}`, () => data.replace(-1, 0), done);
      });
    }
  });

});
