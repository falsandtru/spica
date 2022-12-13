import { benchmark } from './benchmark';
import { clock } from '../src/chrono';

describe('Benchmark:', function () {
  describe('Chrono', function () {
    for (const size of [1, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`resolve ${size.toLocaleString('en')}`, function (done) {
        benchmark(`Chrono resolve ${size.toLocaleString('en')}`, done => {
          for (let i = 0; i < size; ++i) {
            Promise.resolve().then(() => 0);
          }
          Promise.resolve().then(done);
        }, done, { defer: true });
      });

      it(`then ${size.toLocaleString('en')}`, function (done) {
        const p = Promise.resolve();
        benchmark(`Chrono then ${size.toLocaleString('en')}`, done => {
          for (let i = 0; i < size; ++i) {
            p.then(() => 0);
          }
          p.then(done);
        }, done, { defer: true });
      });

      it(`next ${size.toLocaleString('en')}`, function (done) {
        benchmark(`Chrono next ${size.toLocaleString('en')}`, done => {
          for (let i = 0; i < size; ++i) {
            clock.next(() => 0);
          }
          clock.next(done);
        }, done, { defer: true });
      });

      it(`micro ${size.toLocaleString('en')}`, function (done) {
        benchmark(`Chrono micro ${size.toLocaleString('en')}`, done => {
          for (let i = 0; i < size; ++i) {
            queueMicrotask(() => 0);
          }
          queueMicrotask(done);
        }, done, { defer: true });
      });

      it(`now ${size.toLocaleString('en')}`, function (done) {
        benchmark(`Chrono now ${size.toLocaleString('en')}`, done => {
          for (let i = 0; i < size; ++i) {
            clock.now(() => 0);
          }
          clock.now(done);
        }, done, { defer: true });
      });
    }
  });

});
