import { benchmark } from './benchmark';
import { List as IxList } from '../src/ixlist';
import { List } from '../src/list';
import Yallist from 'yallist';

class Node {
  constructor(public value: number) { }
  public next?: this = undefined;
  public prev?: this = undefined;
}

describe.skip('Benchmark:', function () {
  describe('List', function () {
    it('Yallist new', function (done) {
      benchmark('Yallist new', () => Yallist.create(), done);
    });

    it('List    new', function (done) {
      benchmark('List    new', () => new List(), done);
    });

    it('IxList  new', function (done) {
      benchmark('IxList  new', () => new IxList(), done);
    });

    for (const size of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Yallist add ${size.toLocaleString('en')}`, function (done) {
        const list = new Yallist();
        for (let i = 0; i < size; ++i) list.unshift(0);
        benchmark(`Yallist add ${size.toLocaleString('en')}`, () => {
          list.pop();
          list.unshift(0);
        }, done);
      });

      it(`List    add ${size.toLocaleString('en')}`, function (done) {
        const list = new List();
        for (let i = 0; i < size; ++i) list.unshift(new Node(0));
        benchmark(`List    add ${size.toLocaleString('en')}`, () => {
          list.pop();
          list.unshift(new Node(0));
        }, done);
      });

      it(`IxList  add ${size.toLocaleString('en')}`, function (done) {
        const list = new IxList();
        for (let i = 0; i < size; ++i) list.unshift(0);
        benchmark(`IxList  add ${size.toLocaleString('en')}`, () => {
          list.pop();
          list.unshift(0);
        }, done);
      });

      it(`IxList  add rotationally ${size.toLocaleString('en')}`, function (done) {
        const list = new IxList();
        for (let i = 0; i < size; ++i) list.unshift(0);
        benchmark(`IxList  add rotationally ${size.toLocaleString('en')}`, () => {
          list.unshiftRotationally(0);
        }, done);
      });

      it(`IxList  add with constraint ${size.toLocaleString('en')}`, function (done) {
        const list = new IxList(size);
        for (let i = 0; i < size; ++i) list.unshift(0);
        benchmark(`IxList  add with constraint ${size.toLocaleString('en')}`, () => {
          list.unshift(0);
        }, done);
      });
    }

    for (const size of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Yallist access ${size.toLocaleString('en')}`, function (done) {
        const list = new Yallist<Node>();
        for (let i = 0; i < size; ++i) list.unshift(new Node(0));
        benchmark(`Yallist access ${size.toLocaleString('en')}`, () => {
          list.pop()?.value;
          list.unshift(new Node(0));
        }, done);
      });

      it(`List    access ${size.toLocaleString('en')}`, function (done) {
        const list = new List<Node>();
        for (let i = 0; i < size; ++i) list.unshift(new Node(0));
        benchmark(`List    access ${size.toLocaleString('en')}`, () => {
          list.pop()?.value;
          list.unshift(new Node(0));
        }, done);
      });

      it(`IxList  access ${size.toLocaleString('en')}`, function (done) {
        const list = new IxList<Node>();
        for (let i = 0; i < size; ++i) list.unshift(new Node(0));
        benchmark(`IxList  access ${size.toLocaleString('en')}`, () => {
          list.pop()?.value;
          list.unshift(new Node(0));
        }, done);
      });

      it(`IxList  access rotationally ${size.toLocaleString('en')}`, function (done) {
        const list = new IxList<Node>();
        for (let i = 0; i < size; ++i) list.unshift(new Node(0));
        benchmark(`IxList  access rotationally ${size.toLocaleString('en')}`, () => {
          list.last;
          list.unshiftRotationally(new Node(0));
        }, done);
      });

      it(`IxList  access with constraint ${size.toLocaleString('en')}`, function (done) {
        const list = new IxList<Node>(size);
        for (let i = 0; i < size; ++i) list.unshift(new Node(0));
        benchmark(`IxList  access with constraint ${size.toLocaleString('en')}`, () => {
          list.last;
          list.unshift(new Node(0));
        }, done);
      });
    }

    for (const size of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Yallist move ${size.toLocaleString('en')}`, function (done) {
        const list = new Yallist();
        for (let i = 0; i < size; ++i) list.unshift(0);
        benchmark(`Yallist move ${size.toLocaleString('en')}`, () => {
          list.unshiftNode(list.tail!.prev!);
        }, done);
      });

      it(`List    move ${size.toLocaleString('en')}`, function (done) {
        const list = new List();
        for (let i = 0; i < size; ++i) list.unshift(new Node(0));
        benchmark(`List    move ${size.toLocaleString('en')}`, () => {
          const node = list.head?.prev?.prev!;
          list.delete(node);
          list.unshift(node);
        }, done);
      });

      it(`IxList  move ${size.toLocaleString('en')}`, function (done) {
        const list = new IxList(size);
        for (let i = 0; i < size; ++i) list.unshift(0);
        benchmark(`IxList  move ${size.toLocaleString('en')}`, () => {
          list.moveToHead(list.prev(list.last));
        }, done);
      });
    }

  });

});
