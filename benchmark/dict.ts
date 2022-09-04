import { benchmark } from './benchmark';
import { undefined, Map } from '../src/global';
import { List as IxList } from '../src/ixlist';

describe('Benchmark:', function () {
  describe('Dict', function () {
    it('new', function (done) {
      benchmark('Map new', () => new Map(), done);
    });

    it('new', function (done) {
      benchmark('IxList new', () => new IxList(), done);
    });

    for (const length of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Map set ${length.toLocaleString('en')}`, function (done) {
        const dict = new Map();
        let i = 0;
        benchmark(`Map set ${length.toLocaleString('en')}`, () => {
          dict.set(++i % length, undefined);
        }, done);
      });

      it(`IxList set ${length.toLocaleString('en')}`, function (done) {
        const dict = new IxList(new Map());
        let i = 0;
        benchmark(`IxList set ${length.toLocaleString('en')}`, () => {
          dict.put(++i % length, undefined);
        }, done);
      });
    }

    for (const length of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`Map has/get ${length.toLocaleString('en')}`, function (done) {
        const dict = new Map();
        let i = 0;
        benchmark(`Map has/get ${length.toLocaleString('en')}`, () => {
          dict.has(++i % length)
            ? dict.get(i % length)
            : dict.set(i % length, undefined);
        }, done);
      });

      it(`IxList has/get ${length.toLocaleString('en')}`, function (done) {
        const dict = new IxList(new Map());
        let i = 0;
        benchmark(`IxList has/get ${length.toLocaleString('en')}`, () => {
          dict.has(++i % length)
            ? dict.get(i % length)
            : dict.put(i % length, undefined);
        }, done);
      });
    }

  });

});
