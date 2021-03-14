import { benchmark } from './benchmark';
import { IvList } from '..';
import { IxList } from '..';
import Yallist from 'yallist';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('IxList', function () {
    this.beforeEach(done => {
      setTimeout(done, 1000);
    });

    it('new', function (done) {
      benchmark('Yalist new', () => Yallist.create(), done);
    });

    it('new', function (done) {
      benchmark('IvList new', () => new IvList(), done);
    });

    it('new', function (done) {
      benchmark('IxList new', () => new IxList(100), done);
    });

    for (const length of [10, 100, 1000, 10000, 100000]) {
      it(`Yalist add ${length.toLocaleString('en')}`, function (done) {
        const cap = length;
        const list = new Yallist();
        let i = 0;
        benchmark(`Yalist add ${length.toLocaleString('en')}`, () => {
          if (++i > cap) {
            list.pop();
            list.unshift(i);
          }
          else {
            list.unshift(i);
          }
        }, done);
      });

      it(`IvList add ${length.toLocaleString('en')}`, function (done) {
        const cap = length;
        const list = new IvList();
        let i = 0;
        benchmark(`IvList add ${length.toLocaleString('en')}`, () => {
          if (++i > cap) {
            list.pop();
            list.unshift(i);
          }
          else {
            list.unshift(i);
          }
        }, done);
      });

      it(`IvList add ${length.toLocaleString('en')} rotationally`, function (done) {
        const cap = length;
        const list = new IvList();
        let i = 0;
        benchmark(`IvList add ${length.toLocaleString('en')} rotationally`, () => {
          if (++i > cap) {
            list.unshiftRotationally(i);
          }
          else {
            list.unshift(i);
          }
        }, done);
      });

      it(`IxList add ${length.toLocaleString('en')}`, function (done) {
        const cap = length;
        const list = new IxList();
        let i = 0;
        benchmark(`IxList add ${length.toLocaleString('en')}`, () => {
          if (++i > cap) {
            list.pop();
            list.unshift(i);
          }
          else {
            list.unshift(i);
          }
        }, done);
      });

      it(`IxList add ${length.toLocaleString('en')} rotationally`, function (done) {
        const cap = length;
        const list = new IxList();
        let i = 0;
        benchmark(`IxList add ${length.toLocaleString('en')} rotationally`, () => {
          if (++i > cap) {
            list.unshiftRotationally(i);
          }
          else {
            list.unshift(i);
          }
        }, done);
      });

      it(`IxList add ${length.toLocaleString('en')} with constraint`, function (done) {
        const cap = length;
        const list = new IxList(cap);
        let i = 0;
        benchmark(`IxList add ${length.toLocaleString('en')} with constraint`, () => {
          list.unshift(i);
        }, done);
      });
    }

    for (const length of [10, 100, 1000, 10000, 100000]) {
      it(`IxList put ${length.toLocaleString('en')}`, function (done) {
        const cap = length;
        const list = new IxList(cap, new Map());
        let i = 0;
        benchmark(`IxList put ${length.toLocaleString('en')}`, () => list.put(++i % cap), done);
      });
    }

  });

});
