import { benchmark } from './benchmark';
import { MList } from '../';
import { Array } from '../src/global';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('MList', function () {
    it('cons', function (done) {
      benchmark('MList cons', () => MList(), done);
    });

    it('length 10', function (done) {
      const node = MList(...Array(10));
      benchmark('MList length 10', () => node.length, done);
    });

    it('length 100', function (done) {
      const node = MList(...Array(100));
      benchmark('MList length 100', () => node.length, done);
    });

    it('length 1000', function (done) {
      const node = MList(...Array(1000));
      benchmark('MList length 1000', () => node.length, done);
    });

    it('reverse 10', function (done) {
      let node = MList(...Array(10));
      benchmark('MList reverse 10', () => node = node.reverse(), done);
    });

    it('reverse 100', function (done) {
      let node = MList(...Array(100));
      benchmark('MList reverse 100', () => node = node.reverse(), done);
    });

    it('reverse 1000', function (done) {
      let node = MList(...Array(1000));
      benchmark('MList reverse 1000', () => node = node.reverse(), done);
    });

    it('map 10', function (done) {
      const node = MList(...Array(10));
      benchmark('MList map 10', () => node.map(v => v), done);
    });

    it('map 100', function (done) {
      const node = MList(...Array(100));
      benchmark('MList map 100', () => node.map(v => v), done);
    });

    it('map 1000', function (done) {
      const node = MList(...Array(1000));
      benchmark('MList map 1000', () => node.map(v => v), done);
    });

  });

});
