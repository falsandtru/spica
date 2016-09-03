import {benchmark} from './benchmark';
import {IContextDefinition} from 'mocha';
import {DataMap, AttrMap} from 'spica';

describe('Benchmark:', function (this: IContextDefinition) {
  this.timeout(10 * 1e3);

  describe('DataMap', function () {
    it('get', function (done) {
      const map = new DataMap<string[], number>();
      const key = ['a', 'b'];
      map.set(key, 0);
      benchmark('DataMap get', () => map.get(key), done);
    });

    it('set', function (done) {
      const map = new DataMap<string[], number>();
      const key = ['a', 'b'];
      benchmark('DataMap set', () => map.set(key, 0), done);
    });

  });

  describe('AttrMap', function () {
    it('get', function (done) {
      const map = new AttrMap<{}, string, number>();
      const obj = {};
      map.set(obj, 'abc', 0);
      benchmark('AttrMap get', () => map.get(obj, 'abc'), done);
    });

    it('set', function (done) {
      const map = new AttrMap<{}, string, number>();
      const obj = {};
      benchmark('AttrMap set', () => map.set(obj, 'abc', 0), done);
    });

  });

});
