import {benchmark} from './benchmark';
import {Map, DataMap, WeakMap, AttrMap, RelationMap} from 'spica';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('Map', function () {
    it('get', function (done) {
      const map = new Map<string, number>();
      map.set('abc', 0);
      benchmark('Map get', () => map.get('abc'), done);
    });

    it('set', function (done) {
      const map = new Map<string, number>();
      benchmark('Map set', () => map.set('abc', 0), done);
    });

  });

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

  describe('WeakMap', function () {
    it('get', function (done) {
      const map = new WeakMap<{}, number>();
      const key = {};
      map.set(key, 0);
      benchmark('WeakMap get', () => map.get(key), done);
    });

    it('set', function (done) {
      const map = new WeakMap<{}, number>();
      const key = {};
      benchmark('WeakMap set', () => map.set(key, 0), done);
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

  describe('RelationMap', function () {
    it('get', function (done) {
      const map = new RelationMap<{}, {}, number>();
      const o1 = {};
      const o2 = {};
      map.set(o1, o2, 0);
      benchmark('RelationMap get', () => map.get(o1, o2), done);
    });

    it('set', function (done) {
      const map = new RelationMap<{}, {}, number>();
      const o1 = {};
      const o2 = {};
      benchmark('RelationMap set', () => map.set(o1, o2, 0), done);
    });

  });

});
