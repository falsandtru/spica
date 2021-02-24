import { benchmark } from './benchmark';
import { WList } from '..';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('WList', function () {
    it('new', function (done) {
      benchmark('WList new', () => new WList(100), done);
    });

    it('add 10', function (done) {
      const cap = 10;
      const list = new WList(cap);
      let i = 0;
      benchmark('WList add 10', () => list.add(++i % cap), done);
    });

    it('add 100', function (done) {
      const cap = 100;
      const list = new WList(cap);
      let i = 0;
      benchmark('WList add 100', () => list.add(++i % cap), done);
    });

    it('add 1000', function (done) {
      const cap = 1000;
      const list = new WList(cap);
      let i = 0;
      benchmark('WList add 1000', () => list.add(++i % cap), done);
    });

    it('put 10', function (done) {
      const cap = 10;
      const list = new WList(cap);
      let i = 0;
      benchmark('WList put 10', () => list.put(++i % cap), done);
    });

    it('put 100', function (done) {
      const cap = 100;
      const list = new WList(cap);
      let i = 0;
      benchmark('WList put 100', () => list.put(++i % cap), done);
    });

    it('put 1000', function (done) {
      const cap = 1000;
      const list = new WList(cap);
      let i = 0;
      benchmark('WList put 1000', () => list.put(++i % cap), done);
    });

  });

});
