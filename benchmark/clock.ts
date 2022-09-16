import { Promise, queueMicrotask } from '../src/global';
import { benchmark } from './benchmark';
import { clock } from '../src/clock';

describe('Benchmark:', function () {
  describe('Clock', function () {
    for (const length of [1, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6]) {
      it(`resolve ${length.toLocaleString('en')}`, function (done) {
        benchmark(`Clock resolve ${length.toLocaleString('en')}`, done => {
          for (let i = 0; i < length; ++i) {
            Promise.resolve().then(() => 0);
          }
          Promise.resolve().then(done);
        }, done, { defer: true });
      });

      it(`then ${length.toLocaleString('en')}`, function (done) {
        const p = Promise.resolve();
        benchmark(`Clock then ${length.toLocaleString('en')}`, done => {
          for (let i = 0; i < length; ++i) {
            p.then(() => 0);
          }
          p.then(done);
        }, done, { defer: true });
      });

      it(`next ${length.toLocaleString('en')}`, function (done) {
        benchmark(`Clock next ${length.toLocaleString('en')}`, done => {
          for (let i = 0; i < length; ++i) {
            clock.next(() => 0);
          }
          clock.next(done);
        }, done, { defer: true });
      });

      it(`micro ${length.toLocaleString('en')}`, function (done) {
        benchmark(`Clock micro ${length.toLocaleString('en')}`, done => {
          for (let i = 0; i < length; ++i) {
            queueMicrotask(() => 0);
          }
          queueMicrotask(done);
        }, done, { defer: true });
      });

      it(`now ${length.toLocaleString('en')}`, function (done) {
        benchmark(`Clock now ${length.toLocaleString('en')}`, done => {
          for (let i = 0; i < length; ++i) {
            clock.now(() => 0);
          }
          clock.now(done);
        }, done, { defer: true });
      });
    }
  });

});
