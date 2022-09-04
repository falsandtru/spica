import { benchmark } from './benchmark';
import { List as InvList } from '../src/invlist';
import { List as IxList } from '../src/ixlist';
import Yallist from 'yallist';

describe('Benchmark:', function () {
  describe('List', function () {
    it('Yallist new', function (done) {
      benchmark('Yallist new', () => Yallist.create(), done);
    });

    it('InvList new', function (done) {
      benchmark('InvList new', () => new InvList(), done);
    });

    it('IxList  new', function (done) {
      benchmark('IxList  new', () => new IxList(), done);
    });

    for (const length of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Yallist add ${length.toLocaleString('en')}`, function (done) {
        benchmark(`Yallist add ${length.toLocaleString('en')}`, () => {
          const list = new Yallist();
          for (let i = 0; i < length; ++i) list.push(0);
        }, done);
      });

      it(`InvList add ${length.toLocaleString('en')}`, function (done) {
        benchmark(`InvList add ${length.toLocaleString('en')}`, () => {
          const list = new InvList();
          for (let i = 0; i < length; ++i) list.push(0);
        }, done);
      });

      it(`InvList add ${length.toLocaleString('en')} rotationally`, function (done) {
        benchmark(`InvList add ${length.toLocaleString('en')} rotationally`, () => {
          const list = new InvList();
          for (let i = 0; i < length; ++i) list.unshiftRotationally(0);
        }, done);
      });

      it(`IxList  add ${length.toLocaleString('en')}`, function (done) {
        benchmark(`IxList  add ${length.toLocaleString('en')}`, () => {
          const list = new IxList();
          for (let i = 0; i < length; ++i) list.push(0);
        }, done);
      });

      it(`IxList  add ${length.toLocaleString('en')} rotationally`, function (done) {
        const list = new IxList();
        for (let i = 0; i < length; ++i) list.push(0);
        benchmark(`IxList  add ${length.toLocaleString('en')} rotationally`, () => {
          for (let i = 0; i < length; ++i) list.unshiftRotationally(0);
        }, done);
      });

      it(`IxList  add ${length.toLocaleString('en')} with constraint`, function (done) {
        const list = new IxList(length);
        for (let i = 0; i < length; ++i) list.push(0);
        benchmark(`IxList  add ${length.toLocaleString('en')} with constraint`, () => {
          for (let i = 0; i < length; ++i) list.unshift(0);
        }, done);
      });
    }

    for (const length of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`IxList  put ${length.toLocaleString('en')}`, function (done) {
        const list = new IxList(length, new Map());
        for (let i = 0; i < length; ++i) list.push(0);
        let i = 0;
        benchmark(`IxList  put ${length.toLocaleString('en')}`, () => list.put(++i % length), done);
      });
    }

    for (const length of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Yallist move ${length.toLocaleString('en')}`, function (done) {
        const list = new Yallist();
        for (let i = 0; i < length; ++i) list.push(0);
        benchmark(`Yallist move ${length.toLocaleString('en')}`, () => {
          list.unshiftNode(list.tail!.prev!);
        }, done);
      });

      it(`InvList move ${length.toLocaleString('en')}`, function (done) {
        const list = new InvList();
        for (let i = 0; i < length; ++i) list.push(0);
        benchmark(`InvList move ${length.toLocaleString('en')}`, () => {
          list.last!.prev.moveToHead();
        }, done);
      });

      it(`IxList  move ${length.toLocaleString('en')}`, function (done) {
        const list = new IxList();
        for (let i = 0; i < length; ++i) list.push(0);
        benchmark(`IxList  move ${length.toLocaleString('en')}`, () => {
          list.moveToHead(list.last!.prev);
        }, done);
      });
    }

  });

});
