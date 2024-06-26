import { benchmark } from './benchmark';
import { List as IxList } from '../src/ixlist';
import { List } from '../src/list';
import { List as CList } from '../src/clist';
import { Yallist } from 'yallist';

class Node {
  constructor(public value: object) { }
  public next?: this = undefined;
  public prev?: this = undefined;
}

describe('Benchmark:', function () {
  describe('List', function () {
    it('Yallist new', function (done) {
      benchmark('Yallist new', () => Yallist.create(), done);
    });

    it('List    new', function (done) {
      benchmark('List    new', () => new List(), done);
    });

    it('CList   new', function (done) {
      benchmark('CList   new', () => new CList(), done);
    });

    it('IxList  new', function (done) {
      benchmark('IxList  new', () => new IxList(), done);
    });

    for (const size of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Yallist add ${size.toLocaleString('en')}`, function (done) {
        const list = new Yallist();
        for (let i = 0; i < size; ++i) list.unshift({});
        benchmark(`Yallist add ${size.toLocaleString('en')}`, () => {
          list.shift();
          list.push({});
        }, done);
      });

      it(`List    add ${size.toLocaleString('en')}`, function (done) {
        const list = new List();
        for (let i = 0; i < size; ++i) list.unshift(new Node({}));
        benchmark(`List    add ${size.toLocaleString('en')}`, () => {
          list.shift();
          list.push(new Node({}));
        }, done);
      });

      it(`CList   add ${size.toLocaleString('en')}`, function (done) {
        const list = new CList();
        for (let i = 0; i < size; ++i) list.unshift(new Node({}));
        benchmark(`CList   add ${size.toLocaleString('en')}`, () => {
          list.shift();
          list.push(new Node({}));
        }, done);
      });

      it(`CList   add rotationally ${size.toLocaleString('en')}`, function (done) {
        const list = new CList<Node>();
        for (let i = 0; i < size; ++i) list.unshift(new Node({}));
        benchmark(`CList   add rotationally ${size.toLocaleString('en')}`, () => {
          // 先頭を対象にすれば他の要素を読み込まない。
          list.head!.value = {};
          list.head = list.head!.next;
        }, done);
      });

      it(`IxList  add ${size.toLocaleString('en')}`, function (done) {
        const list = new IxList();
        for (let i = 0; i < size; ++i) list.unshift({});
        benchmark(`IxList  add ${size.toLocaleString('en')}`, () => {
          list.pop();
          list.unshift({});
        }, done);
      });

      it(`IxList  add rotationally ${size.toLocaleString('en')}`, function (done) {
        const list = new IxList();
        for (let i = 0; i < size; ++i) list.unshift({});
        benchmark(`IxList  add rotationally ${size.toLocaleString('en')}`, () => {
          list.unshiftRotationally({});
        }, done);
      });

      it(`IxList  add with constraint ${size.toLocaleString('en')}`, function (done) {
        const list = new IxList(size);
        for (let i = 0; i < size; ++i) list.unshift({});
        benchmark(`IxList  add with constraint ${size.toLocaleString('en')}`, () => {
          list.unshift({});
        }, done);
      });
    }

    for (const size of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Yallist access ${size.toLocaleString('en')}`, function (done) {
        const list = new Yallist<Node>();
        for (let i = 0; i < size; ++i) list.unshift(new Node({}));
        let node = list.head!;
        benchmark(`Yallist access ${size.toLocaleString('en')}`, () => {
          node.value.value;
          node = node.next ?? list.head!;
        }, done);
      });

      it(`List    access ${size.toLocaleString('en')}`, function (done) {
        const list = new List<Node>();
        for (let i = 0; i < size; ++i) list.unshift(new Node({}));
        let node = list.head!;
        benchmark(`List    access ${size.toLocaleString('en')}`, () => {
          node.value;
          node = node.next ?? list.head!;
        }, done);
      });

      it(`CList   access ${size.toLocaleString('en')}`, function (done) {
        const list = new CList<Node>();
        for (let i = 0; i < size; ++i) list.unshift(new Node({}));
        let node = list.head!;
        benchmark(`CList   access ${size.toLocaleString('en')}`, () => {
          node.value;
          node = node.next!;
        }, done);
      });

      it(`IxList  access ${size.toLocaleString('en')}`, function (done) {
        const list = new IxList<Node>();
        for (let i = 0; i < size; ++i) list.unshift(new Node({}));
        let index = list.head;
        benchmark(`IxList  access ${size.toLocaleString('en')}`, () => {
          list.get(index).value;
          index = list.next(index);
        }, done);
      });
    }

    for (const size of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Yallist move ${size.toLocaleString('en')}`, function (done) {
        const list = new Yallist();
        for (let i = 0; i < size; ++i) list.unshift({});
        benchmark(`Yallist move ${size.toLocaleString('en')}`, () => {
          list.unshiftNode(list.tail!.prev!);
        }, done);
      });

      it(`List    move ${size.toLocaleString('en')}`, function (done) {
        const list = new List();
        for (let i = 0; i < size; ++i) list.unshift(new Node({}));
        benchmark(`List    move ${size.toLocaleString('en')}`, () => {
          const node = list.last!.prev!;
          list.delete(node);
          list.unshift(node);
        }, done);
      });

      it(`CList   move ${size.toLocaleString('en')}`, function (done) {
        const list = new CList();
        for (let i = 0; i < size; ++i) list.unshift(new Node({}));
        benchmark(`CList   move ${size.toLocaleString('en')}`, () => {
          const node = list.last!.prev!;
          list.delete(node);
          list.unshift(node);
        }, done);
      });

      it(`IxList  move ${size.toLocaleString('en')}`, function (done) {
        const list = new IxList(size);
        for (let i = 0; i < size; ++i) list.unshift({});
        benchmark(`IxList  move ${size.toLocaleString('en')}`, () => {
          list.moveToHead(list.prev(list.last));
        }, done);
      });
    }

  });

});
