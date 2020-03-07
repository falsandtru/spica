import { benchmark } from './benchmark';
import { CList } from '../src/cont';
import { Array } from '../src/global';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('CList', function () {
    it('cons', function (done) {
      benchmark('CList cons', () => CList(), done);
    });

    it('length 10', function (done) {
      const node = CList(...Array(10));
      benchmark('CList length 10', () => node.length, done);
    });

    it('length 100', function (done) {
      const node = CList(...Array(100));
      benchmark('CList length 100', () => node.length, done);
    });

    it('length 1000', function (done) {
      const node = CList(...Array(1000));
      benchmark('CList length 1000', () => node.length, done);
    });

    it('reverse 10', function (done) {
      let node = CList(...Array(10));
      benchmark('CList reverse 10', () => node = node.reverse(), done);
    });

    it('reverse 100', function (done) {
      let node = CList(...Array(100));
      benchmark('CList reverse 100', () => node = node.reverse(), done);
    });

    it('reverse 1000', function (done) {
      let node = CList(...Array(1000));
      benchmark('CList reverse 1000', () => node = node.reverse(), done);
    });

    it('map 10', function (done) {
      const node = CList(...Array(10));
      benchmark('CList map 10', () => node.map(v => v), done);
    });

    it('map 100', function (done) {
      const node = CList(...Array(100));
      benchmark('CList map 100', () => node.map(v => v), done);
    });

    it('map 1000', function (done) {
      const node = CList(...Array(1000));
      benchmark('CList map 1000', () => node.map(v => v), done);
    });

  });

});
