import { benchmark } from './benchmark';
import { IxList } from '..';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('IxList', function () {
    it('new', function (done) {
      benchmark('IxList new', () => new IxList(100), done);
    });

    it('add 10', function (done) {
      const cap = 10;
      const list = new IxList(cap);
      let i = 0;
      benchmark('IxList add 10', () => list.add(++i % cap), done);
    });

    it('add 100', function (done) {
      const cap = 100;
      const list = new IxList(cap);
      let i = 0;
      benchmark('IxList add 100', () => list.add(++i % cap), done);
    });

    it('add 1000', function (done) {
      const cap = 1000;
      const list = new IxList(cap);
      let i = 0;
      benchmark('IxList add 1000', () => list.add(++i % cap), done);
    });

    it('put 10', function (done) {
      const cap = 10;
      const list = new IxList(cap, new Map());
      let i = 0;
      benchmark('IxList put 10', () => list.put(++i % cap), done);
    });

    it('put 100', function (done) {
      const cap = 100;
      const list = new IxList(cap, new Map());
      let i = 0;
      benchmark('IxList put 100', () => list.put(++i % cap), done);
    });

    it('put 1000', function (done) {
      const cap = 1000;
      const list = new IxList(cap, new Map());
      let i = 0;
      benchmark('IxList put 1000', () => list.put(++i % cap), done);
    });

  });

});
