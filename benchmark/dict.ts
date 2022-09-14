import { benchmark } from './benchmark';
import { Map } from '../src/global';
import { IxMap } from '../src/ixmap';
import { MultiMap } from '../src/multimap';
import { List as IxList } from '../src/ixlist';

describe('Benchmark:', function () {
  describe('Dict', function () {
    it('Map new', function (done) {
      benchmark('Map new', () => new Map(), done);
    });

    it('IxMap new', function (done) {
      benchmark('IxMap new', () => new IxMap(), done);
    });

    it('MultiMap new', function (done) {
      benchmark('MultiMap new', () => new MultiMap(), done);
    });

    it('IxList new', function (done) {
      benchmark('IxList new', () => new IxList(), done);
    });

    for (const length of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Map get ${length.toLocaleString('en')}`, function (done) {
        const dict = new Map();
        for (let i = 0; i < length; ++i) dict.set(i, {});
        let i = 0;
        benchmark(`Map get ${length.toLocaleString('en')}`, () => {
          dict.get(i = ++i % length);
        }, done);
      });

      it(`IxMap get ${length.toLocaleString('en')}`, function (done) {
        const dict = new IxMap();
        for (let i = 0; i < length; ++i) dict.set(i, {});
        let i = 0;
        benchmark(`IxMap get ${length.toLocaleString('en')}`, () => {
          dict.get(i = ++i % length);
        }, done);
      });

      it(`MultiMap get ${length.toLocaleString('en')}`, function (done) {
        const dict = new MultiMap();
        for (let i = 0; i < length; ++i) dict.set(i, {});
        let i = 0;
        benchmark(`MultiMap get ${length.toLocaleString('en')}`, () => {
          dict.get(i = ++i % length);
        }, done);
      });

      it(`IxList get ${length.toLocaleString('en')}`, function (done) {
        const dict = new IxList<number, {}>(new Map());
        for (let i = 0; i < length; ++i) dict.add(i, {});
        let i = 0;
        benchmark(`IxList get ${length.toLocaleString('en')}`, () => {
          dict.search(i = ++i % length);
        }, done);
      });
    }

    for (const length of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Map set ${length.toLocaleString('en')}`, function (done) {
        const dict = new Map();
        let i = 0;
        benchmark(`Map set ${length.toLocaleString('en')}`, () => {
          dict.set(i = ++i % length, {});
        }, done);
      });

      it(`IxMap set ${length.toLocaleString('en')}`, function (done) {
        const dict = new IxMap();
        let i = 0;
        benchmark(`IxMap set ${length.toLocaleString('en')}`, () => {
          dict.set(i = ++i % length, {});
        }, done);
      });

      it(`MultiMap set ${length.toLocaleString('en')}`, function (done) {
        const dict = new MultiMap();
        let i = 0;
        benchmark(`MultiMap set ${length.toLocaleString('en')}`, () => {
          dict.set(i = ++i % length, {});
        }, done);
      });

      it(`IxList set ${length.toLocaleString('en')}`, function (done) {
        const dict = new IxList<number, {}>(new Map());
        let i = 0;
        benchmark(`IxList set ${length.toLocaleString('en')}`, () => {
          dict.put(i = ++i % length, {});
        }, done);
      });
    }

    for (const length of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Map get/set ${length.toLocaleString('en')}`, function (done) {
        const dict = new Map();
        let i = 0;
        benchmark(`Map get/set ${length.toLocaleString('en')}`, () => {
          dict.get(i = ++i % length);
          dict.set(i, {});
        }, done);
      });

      it(`IxMap get/set ${length.toLocaleString('en')}`, function (done) {
        const dict = new IxMap();
        let i = 0;
        benchmark(`IxMap get/set ${length.toLocaleString('en')}`, () => {
          dict.get(i = ++i % length);
          dict.set(i, {});
        }, done);
      });

      it(`MultiMap get/set ${length.toLocaleString('en')}`, function (done) {
        const dict = new MultiMap();
        let i = 0;
        benchmark(`MultiMap get/set ${length.toLocaleString('en')}`, () => {
          dict.get(i = ++i % length);
          dict.set(i, {});
        }, done);
      });

      it(`IxList get/set ${length.toLocaleString('en')}`, function (done) {
        const dict = new IxList<number, {}>(new Map());
        let i = 0;
        benchmark(`IxList get/set ${length.toLocaleString('en')}`, () => {
          dict.get(i = ++i % length);
          dict.put(i, {});
        }, done);
      });
    }

    for (const length of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Map has/get ${length.toLocaleString('en')}`, function (done) {
        const dict = new Map();
        let i = 0;
        benchmark(`Map has/get ${length.toLocaleString('en')}`, () => {
          dict.has(i = ++i % length)
            ? dict.get(i % length)
            : dict.set(i % length, {});
        }, done);
      });

      it(`IxMap has/get ${length.toLocaleString('en')}`, function (done) {
        const dict = new IxMap();
        let i = 0;
        benchmark(`IxMap has/get ${length.toLocaleString('en')}`, () => {
          dict.has(i = ++i % length)
            ? dict.get(i % length)
            : dict.set(i % length, {});
        }, done);
      });

      it(`MultiMap has/get ${length.toLocaleString('en')}`, function (done) {
        const dict = new MultiMap();
        let i = 0;
        benchmark(`MultiMap has/get ${length.toLocaleString('en')}`, () => {
          dict.has(i = ++i % length)
            ? dict.get(i % length)
            : dict.set(i % length, {});
        }, done);
      });

      it(`IxList has/get ${length.toLocaleString('en')}`, function (done) {
        const dict = new IxList<number, {}>(new Map());
        let i = 0;
        benchmark(`IxList has/get ${length.toLocaleString('en')}`, () => {
          dict.has(i = ++i % length)
            ? dict.get(i % length)
            : dict.put(i % length, {});
        }, done);
      });
    }

  });

});
