import { benchmark } from './benchmark';
import { Index } from '../src/index';
import { Ring } from '../src/ring';
import { List } from '../src/clist';
import { Stack } from '../src/stack';
import { Queue, PriorityQueue, MultiQueue } from '../src/queue';
import { Heap, MultiHeap } from '../src/heap';

class Node {
  constructor(public value: object) { }
  public next?: this = undefined;
  public prev?: this = undefined;
}

describe('Benchmark:', function () {
  describe('base', function () {
    it('Index  new', function (done) {
      benchmark('Index  new', () => new Index(), done);
    });

    it('Ring   new', function (done) {
      benchmark('Ring   new', () => new Ring(), done);
    });

    it('List   new', function (done) {
      benchmark('List   new', () => new List(), done);
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

    it('MultiHeap new', function (done) {
      benchmark('MultiHeap new', () => new MultiHeap(), done);
    });

    it('PQueue new', function (done) {
      benchmark('PQueue new', () => new PriorityQueue(), done);
    });

    for (const size of [1, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Index        ${size.toLocaleString('en')}`, function (done) {
        const data = new Index();
        for (let i = 0; i < size; ++i) data.pop();
        for (let i = 0; i < size; ++i) data.push(0);
        benchmark(`Index        ${size.toLocaleString('en')}`, () => {
          data.pop();
          data.push(0);
        }, done);
      });

      it(`Array  first ${size.toLocaleString('en')}`, function (done) {
        const data: unknown[] = [];
        for (let i = 0; i < size; ++i) data.push({});
        benchmark(`Array  first ${size.toLocaleString('en')}`, () => {
          data.shift();
          data.unshift({});
        }, done);
      });

      it(`Array  stack ${size.toLocaleString('en')}`, function (done) {
        const data: unknown[] = [];
        for (let i = 0; i < size; ++i) data.push({});
        benchmark(`Array  stack ${size.toLocaleString('en')}`, () => {
          data.pop();
          data.push({});
        }, done);
      });

      it(`Array  queue ${size.toLocaleString('en')}`, function (done) {
        const data: unknown[] = [];
        for (let i = 0; i < size; ++i) data.push({});
        benchmark(`Array  queue ${size.toLocaleString('en')}`, () => {
          data.shift();
          data.push({});
        }, done);
      });

      it(`Ring   queue ${size.toLocaleString('en')}`, function (done) {
        const data = new Ring();
        for (let i = 0; i < size; ++i) data.push({});
        benchmark(`Ring   queue ${size.toLocaleString('en')}`, () => {
          data.shift();
          data.push({});
        }, done);
      });

      it(`List   queue ${size.toLocaleString('en')}`, function (done) {
        const data = new List<Node>();
        for (let i = 0; i < size; ++i) data.push(new Node({}));
        benchmark(`List   queue ${size.toLocaleString('en')}`, () => {
          data.head!.value = {};
          data.head = data.head!.next;
        }, done);
      });

      it(`Stack        ${size.toLocaleString('en')}`, function (done) {
        const data = new Stack();
        for (let i = 0; i < size; ++i) data.push({});
        benchmark(`Stack        ${size.toLocaleString('en')}`, () => {
          data.pop();
          data.push({});
        }, done);
      });

      it(`Queue        ${size.toLocaleString('en')}`, function (done) {
        const data = new Queue();
        for (let i = 0; i < size; ++i) data.push({});
        benchmark(`Queue        ${size.toLocaleString('en')}`, () => {
          data.pop();
          data.push({});
        }, done);
      });

      it(`Heap         ${size.toLocaleString('en')}`, function (done) {
        const data = new Heap(Heap.min);
        for (let i = 0; i < size; ++i) data.insert({}, i);
        let i = data.length;
        benchmark(`Heap         ${size.toLocaleString('en')}`, () => {
          data.extract();
          data.insert({}, ++i);
        }, done);
      });

      it(`MQueue       ${size.toLocaleString('en')}`, function (done) {
        const data = new MultiQueue();
        for (let i = 0; i < size; ++i) data.push(i, {});
        let i = 0;
        benchmark(`MQueue       ${size.toLocaleString('en')}`, () => {
          data.pop(i);
          data.push(i, {});
          i = ++i % size;
        }, done);
      });

      it(`MultiHeap    ${size.toLocaleString('en')}`, function (done) {
        const data = new MultiHeap(MultiHeap.min);
        for (let i = 0; i < size; ++i) data.insert({}, i);
        let i = data.length;
        benchmark(`MultiHeap    ${size.toLocaleString('en')}`, () => {
          data.extract();
          data.insert({}, ++i);
        }, done);
      });

      it(`PQueue       ${size.toLocaleString('en')}`, function (done) {
        const data = new PriorityQueue();
        for (let i = 0; i < size; ++i) data.push(i % 10, {});
        benchmark(`PQueue       ${size.toLocaleString('en')}`, () => {
          data.push(data.pop()!, {});
        }, done);
      });
    }

    for (const size of [0, 1, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Array  index ${size.toLocaleString('en')}`, function (done) {
        const data = Array();
        for (let i = 0; i < size; ++i) data.push({});
        benchmark(`Array  index ${size.toLocaleString('en')}`, () => {
          data.at(-1);
        }, done);
      });

      it(`Ring   index ${size.toLocaleString('en')}`, function (done) {
        const data = new Ring();
        for (let i = 0; i < size; ++i) data.push({});
        benchmark(`Ring   index ${size.toLocaleString('en')}`, () => {
          data.at(-1);
        }, done);
      });

      it(`Stack  peek  ${size.toLocaleString('en')}`, function (done) {
        const data = new Stack();
        for (let i = 0; i < size; ++i) data.push({});
        benchmark(`Stack  peek  ${size.toLocaleString('en')}`, () => {
          data.peek();
        }, done);
      });

      it(`Queue  peek  ${size.toLocaleString('en')}`, function (done) {
        const data = new Queue();
        for (let i = 0; i < size; ++i) data.push({});
        benchmark(`Queue  peek  ${size.toLocaleString('en')}`, () => {
          data.peek();
        }, done);
      });

      it(`Heap   peek  ${size.toLocaleString('en')}`, function (done) {
        const data = new Heap(Heap.min);
        for (let i = 0; i < size; ++i) data.insert({}, i);
        benchmark(`Heap   peek  ${size.toLocaleString('en')}`, () => {
          data.peek();
        }, done);
      });

      it(`MultiHeap peek ${size.toLocaleString('en')}`, function (done) {
        const data = new MultiHeap(MultiHeap.min);
        for (let i = 0; i < size; ++i) data.insert({}, i);
        benchmark(`MultiHeap peek ${size.toLocaleString('en')}`, () => {
          data.peek();
        }, done);
      });

      it(`PQueue peek  ${size.toLocaleString('en')}`, function (done) {
        const data = new PriorityQueue();
        for (let i = 0; i < size; ++i) data.push(i, {});
        benchmark(`PQueue peek  ${size.toLocaleString('en')}`, () => {
          data.peek();
        }, done);
      });
    }

    for (const size of [1, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Array  set ${size.toLocaleString('en')}`, function (done) {
        const data = Array();
        for (let i = 0; i < size; ++i) data.push({});
        benchmark(`Array  set ${size.toLocaleString('en')}`, () => {
          data[size - 1] = {};
        }, done);
      });

      it(`Ring   set ${size.toLocaleString('en')}`, function (done) {
        const data = new Ring();
        for (let i = 0; i < size; ++i) data.push({});
        benchmark(`Ring   set ${size.toLocaleString('en')}`, () => {
          data.set(-1, {});
        }, done);
      });
    }
  });

});
