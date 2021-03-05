import { benchmark } from './benchmark';
import { IList } from '..';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('IList', function () {
    it('new', function (done) {
      benchmark('IList new', () => new IList(100), done);
    });

    it('add 10', function (done) {
      const cap = 10;
      const list = new IList(cap);
      let i = 0;
      benchmark('IList add 10', () => list.add(++i % cap), done);
    });

    it('add 100', function (done) {
      const cap = 100;
      const list = new IList(cap);
      let i = 0;
      benchmark('IList add 100', () => list.add(++i % cap), done);
    });

    it('add 1000', function (done) {
      const cap = 1000;
      const list = new IList(cap);
      let i = 0;
      benchmark('IList add 1000', () => list.add(++i % cap), done);
    });

    it('put 10', function (done) {
      const cap = 10;
      const list = new IList(cap, new Map());
      let i = 0;
      benchmark('IList put 10', () => list.put(++i % cap), done);
    });

    it('put 100', function (done) {
      const cap = 100;
      const list = new IList(cap, new Map());
      let i = 0;
      benchmark('IList put 100', () => list.put(++i % cap), done);
    });

    it('put 1000', function (done) {
      const cap = 1000;
      const list = new IList(cap, new Map());
      let i = 0;
      benchmark('IList put 1000', () => list.put(++i % cap), done);
    });

  });

});
