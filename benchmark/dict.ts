import { benchmark } from './benchmark';
import { undefined, Map } from '../src/global';
import { List as IxList } from '../src/ixlist';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('Dict', function () {
    this.afterEach(done => {
      setTimeout(done, 1000);
    });

    it('new', function (done) {
      benchmark('Map new', () => new Map(), done);
    });

    it('new', function (done) {
      benchmark('IxList new', () => new IxList(), done);
    });

    for (const length of [10, 100, 1000, 10000, 100000, 1000000]) {
      it(`Map set ${length.toLocaleString('en')}`, function (done) {
        const cap = length;
        const dict = new Map();
        let i = 0;
        benchmark(`Map set ${length.toLocaleString('en')}`, () => {
          dict.set(++i % cap, undefined);
        }, done);
      });

      it(`IxList set ${length.toLocaleString('en')}`, function (done) {
        const cap = length;
        const dict = new IxList(new Map());
        let i = 0;
        benchmark(`IxList set ${length.toLocaleString('en')}`, () => {
          dict.put(++i % cap, undefined);
        }, done);
      });
    }

    for (const length of [10, 100, 1000, 10000, 100000]) {
      it(`Map has/get ${length.toLocaleString('en')}`, function (done) {
        const cap = length;
        const dict = new Map();
        let i = 0;
        benchmark(`Map has/get ${length.toLocaleString('en')}`, () => {
          dict.has(++i % cap)
            ? dict.get(i % cap)
            : dict.set(i % cap, undefined);
        }, done);
      });

      it(`IxList has/get ${length.toLocaleString('en')}`, function (done) {
        const cap = length;
        const dict = new IxList(new Map());
        let i = 0;
        benchmark(`IxList has/get ${length.toLocaleString('en')}`, () => {
          dict.has(++i % cap)
            ? dict.get(i % cap)
            : dict.put(i % cap, undefined);
        }, done);
      });
    }

  });

});
