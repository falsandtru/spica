import { benchmark } from './benchmark';
import { IxMap } from '../src/ixmap';
import { MultiMap } from '../src/multimap';

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

    for (const size of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Map get ${size.toLocaleString('en')}`, function (done) {
        const dict = new Map();
        for (let i = 0; i < size; ++i) dict.set(i, {});
        let i = 0;
        benchmark(`Map get ${size.toLocaleString('en')}`, () => {
          dict.get(i = ++i % size);
        }, done);
      });

      it(`IxMap get ${size.toLocaleString('en')}`, function (done) {
        const dict = new IxMap();
        for (let i = 0; i < size; ++i) dict.set(i, {});
        let i = 0;
        benchmark(`IxMap get ${size.toLocaleString('en')}`, () => {
          dict.get(i = ++i % size);
        }, done);
      });

      it(`MultiMap get ${size.toLocaleString('en')}`, function (done) {
        const dict = new MultiMap();
        for (let i = 0; i < size; ++i) dict.set(i, {});
        let i = 0;
        benchmark(`MultiMap get ${size.toLocaleString('en')}`, () => {
          dict.get(i = ++i % size);
        }, done);
      });
    }

    for (const size of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Map set ${size.toLocaleString('en')}`, function (done) {
        const dict = new Map();
        let i = 0;
        benchmark(`Map set ${size.toLocaleString('en')}`, () => {
          dict.set(i = ++i % size, {});
        }, done);
      });

      it(`IxMap set ${size.toLocaleString('en')}`, function (done) {
        const dict = new IxMap();
        let i = 0;
        benchmark(`IxMap set ${size.toLocaleString('en')}`, () => {
          dict.set(i = ++i % size, {});
        }, done);
      });

      it(`MultiMap set ${size.toLocaleString('en')}`, function (done) {
        const dict = new MultiMap();
        let i = 0;
        benchmark(`MultiMap set ${size.toLocaleString('en')}`, () => {
          dict.set(i = ++i % size, {});
        }, done);
      });
    }

    for (const size of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Map get/set ${size.toLocaleString('en')}`, function (done) {
        const dict = new Map();
        let i = 0;
        benchmark(`Map get/set ${size.toLocaleString('en')}`, () => {
          dict.get(i = ++i % size);
          dict.set(i, {});
        }, done);
      });

      it(`IxMap get/set ${size.toLocaleString('en')}`, function (done) {
        const dict = new IxMap();
        let i = 0;
        benchmark(`IxMap get/set ${size.toLocaleString('en')}`, () => {
          dict.get(i = ++i % size);
          dict.set(i, {});
        }, done);
      });

      it(`MultiMap get/set ${size.toLocaleString('en')}`, function (done) {
        const dict = new MultiMap();
        let i = 0;
        benchmark(`MultiMap get/set ${size.toLocaleString('en')}`, () => {
          dict.take(i = ++i % size);
          dict.set(i, {});
        }, done);
      });
    }

    for (const size of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Map has/get ${size.toLocaleString('en')}`, function (done) {
        const dict = new Map();
        let i = 0;
        benchmark(`Map has/get ${size.toLocaleString('en')}`, () => {
          dict.has(i = ++i % size)
            ? dict.get(i % size)
            : dict.set(i % size, {});
        }, done);
      });

      it(`IxMap has/get ${size.toLocaleString('en')}`, function (done) {
        const dict = new IxMap();
        let i = 0;
        benchmark(`IxMap has/get ${size.toLocaleString('en')}`, () => {
          dict.has(i = ++i % size)
            ? dict.get(i % size)
            : dict.set(i % size, {});
        }, done);
      });

      it(`MultiMap has/get ${size.toLocaleString('en')}`, function (done) {
        const dict = new MultiMap();
        let i = 0;
        benchmark(`MultiMap has/get ${size.toLocaleString('en')}`, () => {
          dict.has(i = ++i % size)
            ? dict.take(i % size)
            : dict.set(i % size, {});
        }, done);
      });
    }

  });

});
