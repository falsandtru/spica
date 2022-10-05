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
      benchmark('IxList new', () => new IxList(1), done);
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

    for (const length of [1, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Index        ${length.toLocaleString('en')}`, function (done) {
        const data = new Index;
        for (let i = 0; i < length; ++i) data.pop();
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`Index        ${length.toLocaleString('en')}`, () => (data.pop(), data.push(0)), done);
      });

      it(`Array  first ${length.toLocaleString('en')}`, function (done) {
        const data: unknown[] = [];
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`Array  first ${length.toLocaleString('en')}`, () => (data.shift(), data.unshift(0)), done);
      });

      it(`Array  stack ${length.toLocaleString('en')}`, function (done) {
        const data: unknown[] = [];
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`Array  stack ${length.toLocaleString('en')}`, () => (data.pop(), data.push(0)), done);
      });

      it(`Array  queue ${length.toLocaleString('en')}`, function (done) {
        const data: unknown[] = [];
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`Array  queue ${length.toLocaleString('en')}`, () => (data.shift(), data.push(0)), done);
      });

      it(`Ring   queue ${length.toLocaleString('en')}`, function (done) {
        const data = new Ring();
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`Ring   queue ${length.toLocaleString('en')}`, () => (data.shift(), data.push(0)), done);
      });

      it(`IxList queue ${length.toLocaleString('en')}`, function (done) {
        const data = new IxList(length);
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`IxList queue ${length.toLocaleString('en')}`, () => (data.shift(), data.push(0)), done);
      });

      it(`Stack        ${length.toLocaleString('en')}`, function (done) {
        const data = new Stack();
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`Stack        ${length.toLocaleString('en')}`, () => (data.pop(), data.push(0)), done);
      });

      it(`Queue        ${length.toLocaleString('en')}`, function (done) {
        const data = new Queue();
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`Queue        ${length.toLocaleString('en')}`, () => (data.pop(), data.push(0)), done);
      });

      it(`Heap         ${length.toLocaleString('en')}`, function (done) {
        const heap = new Heap<number>(Heap.min);
        for (let i = 0; i < length; ++i) heap.insert(1, i);
        let i = 0;
        benchmark(`Heap         ${length.toLocaleString('en')}`, () =>
          heap.extract() && heap.insert(1, i = i++ % length), done);
      });

      it(`MQueue       ${length.toLocaleString('en')}`, function (done) {
        const data = new MultiQueue();
        for (let i = 0; i < length; ++i) data.push(i % length, i % length);
        let i = 0;
        benchmark(`MQueue       ${length.toLocaleString('en')}`, () => {
          data.pop(i);
          data.push(i, i);
          i = ++i % length;
        }, done);
      });

      it.skip(`MultiHeap ${length.toLocaleString('en')}`, function (done) {
        const heap = new MultiHeap<number>(MultiHeap.min);
        for (let i = 0; i < length; ++i) heap.insert(1, i);
        let i = 0;
        benchmark(`MultiHeap ${length.toLocaleString('en')}`, () =>
          heap.extract() && heap.insert(1, i = i++ % length), done);
      });

      it(`PQueue       ${length.toLocaleString('en')}`, function (done) {
        const data = new PriorityQueue();
        for (let i = 0; i < length; ++i) data.push(i % 10, i % 10);
        benchmark(`PQueue       ${length.toLocaleString('en')}`, () => {
          const i = data.pop();
          data.push(i, i);
        }, done);
      });
    }

    for (const length of [1, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Array  index ${length.toLocaleString('en')}`, function (done) {
        const data = Array();
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`Array  index ${length.toLocaleString('en')}`, () => data[length - 1], done);
      });

      it(`Ring   index ${length.toLocaleString('en')}`, function (done) {
        const data = new Ring();
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`Ring   index ${length.toLocaleString('en')}`, () => data.at(-1), done);
      });

      it(`IxList index ${length.toLocaleString('en')}`, function (done) {
        const data = new IxList(length);
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`IxList index ${length.toLocaleString('en')}`, () => data.at(-1), done);
      });

      it(`Stack  peek  ${length.toLocaleString('en')}`, function (done) {
        const data = new Stack();
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`Stack  peek  ${length.toLocaleString('en')}`, () => data.peek(), done);
      });

      it(`Queue  peek  ${length.toLocaleString('en')}`, function (done) {
        const data = new Queue();
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`Queue  peek  ${length.toLocaleString('en')}`, () => data.peek(), done);
      });

      it(`Heap   peek  ${length.toLocaleString('en')}`, function (done) {
        const heap = new Heap<number>(Heap.min);
        for (let i = 0; i < length; ++i) heap.insert(1, i);
        benchmark(`Heap   peek  ${length.toLocaleString('en')}`, () =>
          heap.peek(), done);
      });

      it.skip(`MultiHeap peek ${length.toLocaleString('en')}`, function (done) {
        const heap = new MultiHeap<number>(MultiHeap.min);
        for (let i = 0; i < length; ++i) heap.insert(1, i);
        benchmark(`MultiHeap peek ${length.toLocaleString('en')}`, () =>
          heap.peek(), done);
      });

      it(`PQueue peek ${length.toLocaleString('en')}`, function (done) {
        const data = new PriorityQueue();
        for (let i = 0; i < length; ++i) data.push(i, i);
        benchmark(`PQueue peek ${length.toLocaleString('en')}`, () => data.peek(), done);
      });
    }

    for (const length of [1, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Array  set ${length.toLocaleString('en')}`, function (done) {
        const data = Array();
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`Array  set ${length.toLocaleString('en')}`, () => data[length - 1] = 0, done);
      });

      it(`Ring   set ${length.toLocaleString('en')}`, function (done) {
        const data = new Ring();
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`Ring   set ${length.toLocaleString('en')}`, () => data.set(-1, 0), done);
      });

      it(`IxList set ${length.toLocaleString('en')}`, function (done) {
        const data = new IxList(length);
        for (let i = 0; i < length; ++i) data.push(0);
        benchmark(`IxList set ${length.toLocaleString('en')}`, () => data.set(length, 0), done);
      });
    }
  });

});
