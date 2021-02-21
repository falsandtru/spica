import { benchmark } from './benchmark';
import { OList } from '..';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('OList', function () {
    it('new', function (done) {
      benchmark('OList new', () => new OList(100), done);
    });

    it('add 10', function (done) {
      const cap = 10;
      const list = new OList(cap);
      let i = 0;
      benchmark('OList add 10', () => list.add(++i % cap), done);
    });

    it('add 100', function (done) {
      const cap = 100;
      const list = new OList(cap);
      let i = 0;
      benchmark('OList add 100', () => list.add(++i % cap), done);
    });

    it('add 1000', function (done) {
      const cap = 1000;
      const list = new OList(cap);
      let i = 0;
      benchmark('OList add 1000', () => list.add(++i % cap), done);
    });

    it('put 10', function (done) {
      const cap = 10;
      const list = new OList(cap);
      let i = 0;
      benchmark('OList put 10', () => list.put(++i % cap), done);
    });

    it('put 100', function (done) {
      const cap = 100;
      const list = new OList(cap);
      let i = 0;
      benchmark('OList put 100', () => list.put(++i % cap), done);
    });

    it('put 1000', function (done) {
      const cap = 1000;
      const list = new OList(cap);
      let i = 0;
      benchmark('OList put 1000', () => list.put(++i % cap), done);
    });

  });

});
