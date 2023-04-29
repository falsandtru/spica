import { benchmark } from './benchmark';
import { Index } from '../src/index';
import { Ring } from '../src/ring';
import { List as IxList } from '../src/ixlist';
import { Stack } from '../src/stack';
import { Queue, PriorityQueue, MultiQueue } from '../src/queue';
import { Heap, MultiHeap } from '../src/heap';

describe('Benchmark:', function () {
  describe('base', function () {
    it('Index  new', function (done) {
      benchmark('Index  new', () => new Index(), done);
    });

    it('Ring   new', function (done) {
      benchmark('Ring   new', () => new Ring(), done);
    });

    it('IxList new', function (done) {
      benchmark('IxList new', () => new IxList(), done);
    });

    it('Stack  new', function (done) {
      benchmark('Stack  new', () => new Stack(), done);
    });

    it('Queue  new', function (done) {
      benchmark('Queue  new', () => new Queue(), done);
    });

    it('Heap   new', function (done) {
      benchmark('Heap   new', () => new Heap(), done);
    });

    it('MQueue new', function (done) {
      benchmark('MQueue new', () => new MultiQueue(), done);
    });

    it.skip('MultiHeap new', function (done) {
      benchmark('MultiHeap new', () => new MultiHeap(), done);
    });

    it('PQueue new', function (done) {
      benchmark('PQueue new', () => new PriorityQueue(), done);
    });

    for (const size of [1, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6, 1e7]) {
      it(`Index        ${size.toLocaleString('en')}`, function (done) {
        const data = new Index();
        for (let i = 0; i < size; ++i) data.pop();
        for (let i = 0; i < size; ++i) data.push(0);
        benchmark(`Index        ${size.toLocaleString('en')}`, () => (data.pop(), data.push(0)), done);
      });

      it(`Array  first ${size.toLocaleString('en')}`, function (done) {
        const data: unknown[] = [];
        for (let i = 0; i < size; ++i) data.push(0);
        benchmark(`Array  first ${size.toLocaleString('en')}`, () => (data.shift(), data.unshift(0)), done);
      });

      it(`Array  stack ${size.toLocaleString('en')}`, function (done) {
        const data: unknown[] = [];
        for (let i = 0; i < size; ++i) data.push(0);
        benchmark(`Array  stack ${size.toLocaleString('en')}`, () => (data.pop(), data.push(0)), done);
      });

      it(`Array  queue ${size.toLocaleString('en')}`, function (done) {
        const data: unknown[] = [];
        for (let i = 0; i < size; ++i) data.push(0);
        benchmark(`Array  queue ${size.toLocaleString('en')}`, () => (data.shift(), data.push(0)), done);
      });

      it(`Ring   queue ${size.toLocaleString('en')}`, function (done) {
        const data = new Ring();
        for (let i = 0; i < size; ++i) data.push(0);
        benchmark(`Ring   queue ${size.toLocaleString('en')}`, () => (data.shift(), data.push(0)), done);
      });

      it(`IxList queue ${size.toLocaleString('en')}`, function (done) {
        const data = new IxList(size);
        for (let i = 0; i < size; ++i) data.push(0);
        benchmark(`IxList queue ${size.toLocaleString('en')}`, () => (data.shift(), data.push(0)), done);
      });

      it(`Stack        ${size.toLocaleString('en')}`, function (done) {
        const data = new Stack();
        for (let i = 0; i < size; ++i) data.push(0);
        benchmark(`Stack        ${size.toLocaleString('en')}`, () => (data.pop(), data.push(0)), done);
      });

      it(`Queue        ${size.toLocaleString('en')}`, function (done) {
        const data = new Queue();
        for (let i = 0; i < size; ++i) data.push(0);
        benchmark(`Queue        ${size.toLocaleString('en')}`, () => (data.pop(), data.push(0)), done);
      });

      it(`Heap         ${size.toLocaleString('en')}`, function (done) {
        const data = new Heap<number>(Heap.min);
        for (let i = 0; i < size; ++i) data.insert(i, i);
        benchmark(`Heap         ${size.toLocaleString('en')}`, () => {
          const i = data.extract()!;
          data.insert(i, i);
        }, done);
      });

      it(`MQueue       ${size.toLocaleString('en')}`, function (done) {
        const data = new MultiQueue();
        for (let i = 0; i < size; ++i) data.push(i, 0);
        let i = 0;
        benchmark(`MQueue       ${size.toLocaleString('en')}`, () => {
          data.pop(i);
          data.push(i, 0);
          i = ++i % size;
        }, done);
      });

      it.skip(`MultiHeap    ${size.toLocaleString('en')}`, function (done) {
        const data = new MultiHeap<number>(MultiHeap.min);
        for (let i = 0; i < size; ++i) data.insert(i, i);
        benchmark(`MultiHeap    ${size.toLocaleString('en')}`, () => {
          const i = data.extract()!;
          data.insert(i, i);
        }, done);
      });

      it(`PQueue       ${size.toLocaleString('en')}`, function (done) {
        const data = new PriorityQueue<number>();
        for (let i = 0; i < size; ++i) data.push(i % 10, i % 10);
        benchmark(`PQueue       ${size.toLocaleString('en')}`, () => {
          const i = data.pop()!;
          data.push(i, i);
        }, done);
      });
    }

    for (const size of [0, 1, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Array  index ${size.toLocaleString('en')}`, function (done) {
        const data = Array();
        for (let i = 0; i < size; ++i) data.push(0);
        benchmark(`Array  index ${size.toLocaleString('en')}`, () => data.at(-1), done);
      });

      it(`Ring   index ${size.toLocaleString('en')}`, function (done) {
        const data = new Ring();
        for (let i = 0; i < size; ++i) data.push(0);
        benchmark(`Ring   index ${size.toLocaleString('en')}`, () => data.at(-1), done);
      });

      it(`IxList index ${size.toLocaleString('en')}`, function (done) {
        const data = new IxList(size);
        for (let i = 0; i < size; ++i) data.push(0);
        benchmark(`IxList index ${size.toLocaleString('en')}`, () => data.at(-1), done);
      });

      it(`Stack  peek  ${size.toLocaleString('en')}`, function (done) {
        const data = new Stack();
        for (let i = 0; i < size; ++i) data.push(0);
        benchmark(`Stack  peek  ${size.toLocaleString('en')}`, () => data.peek(), done);
      });

      it(`Queue  peek  ${size.toLocaleString('en')}`, function (done) {
        const data = new Queue();
        for (let i = 0; i < size; ++i) data.push(0);
        benchmark(`Queue  peek  ${size.toLocaleString('en')}`, () => data.peek(), done);
      });

      it(`Heap   peek  ${size.toLocaleString('en')}`, function (done) {
        const data = new Heap<number>(Heap.min);
        for (let i = 0; i < size; ++i) data.insert(0, i);
        benchmark(`Heap   peek  ${size.toLocaleString('en')}`, () =>
          data.peek(), done);
      });

      it.skip(`MultiHeap peek ${size.toLocaleString('en')}`, function (done) {
        const data = new MultiHeap<number>(MultiHeap.min);
        for (let i = 0; i < size; ++i) data.insert(0, i);
        benchmark(`MultiHeap peek ${size.toLocaleString('en')}`, () =>
          data.peek(), done);
      });

      it(`PQueue peek  ${size.toLocaleString('en')}`, function (done) {
        const data = new PriorityQueue();
        for (let i = 0; i < size; ++i) data.push(i, i);
        benchmark(`PQueue peek  ${size.toLocaleString('en')}`, () => data.peek(), done);
      });
    }

    for (const size of [1, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Array  set ${size.toLocaleString('en')}`, function (done) {
        const data = Array();
        for (let i = 0; i < size; ++i) data.push(0);
        benchmark(`Array  set ${size.toLocaleString('en')}`, () => data[size - 1] = 0, done);
      });

      it(`Ring   set ${size.toLocaleString('en')}`, function (done) {
        const data = new Ring();
        for (let i = 0; i < size; ++i) data.push(0);
        benchmark(`Ring   set ${size.toLocaleString('en')}`, () => data.set(-1, 0), done);
      });

      it(`IxList set ${size.toLocaleString('en')}`, function (done) {
        const data = new IxList(size);
        for (let i = 0; i < size; ++i) data.push(0);
        benchmark(`IxList set ${size.toLocaleString('en')}`, () => data.set(size, 0), done);
      });
    }
  });

});
