import { benchmark } from './benchmark';
import { tick } from '../src/clock';

describe('Benchmark:', function () {
  describe('Clock', function () {
    for (const length of [1, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`then ${length.toLocaleString('en')}`, function (done) {
        const p = Promise.resolve();
        benchmark(`Clock then ${length.toLocaleString('en')}`, done => {
          for (let i = 0; i < length; ++i) {
            p.then(() => 0);
          }
          p.then(done);
        }, done, { defer: true });
      });

      it(`tick ${length.toLocaleString('en')}`, function (done) {
        benchmark(`Clock tick ${length.toLocaleString('en')}`, done => {
          for (let i = 0; i < length; ++i) {
            tick(() => 0);
          }
          tick(done);
        }, done, { defer: true });
      });
    }
  });

});
