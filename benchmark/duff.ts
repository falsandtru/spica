import { benchmark } from './benchmark';
import { duff, duffbk, duffEach, duffReduce } from '../src/duff';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('for', function () {
    it('1', function (done) {
      benchmark('for 1', () => {
        for (let i = 0; i < 1; ++i);
      }, done);
    });

    it('10', function (done) {
      benchmark('for 10', () => {
        for (let i = 0; i < 10; ++i);
      }, done);
    });

    it('100', function (done) {
      benchmark('for 100', () => {
        for (let i = 0; i < 100; ++i);
      }, done);
    });

    it('1000', function (done) {
      benchmark('for 1000', () => {
        for (let i = 0; i < 1000; ++i);
      }, done);
    });

  });

  describe('duff', function () {
    it('1', function (done) {
      benchmark('duff 1', () => duff(1, i => i), done);
    });

    it('10', function (done) {
      benchmark('duff 10', () => duff(10, i => i), done);
    });

    it('100', function (done) {
      benchmark('duff 100', () => duff(100, i => i), done);
    });

    it('1000', function (done) {
      benchmark('duff 1000', () => duff(1000, i => i), done);
    });

  });

  describe('duffbk', function () {
    it('1', function (done) {
      benchmark('duffbk 1', () => duffbk(1, i => i), done);
    });

    it('10', function (done) {
      benchmark('duffbk 10', () => duffbk(10, i => i), done);
    });

    it('100', function (done) {
      benchmark('duffbk 100', () => duffbk(100, i => i), done);
    });

    it('1000', function (done) {
      benchmark('duffbk 1000', () => duffbk(1000, i => i), done);
    });

  });

  describe('duffEach', function () {
    it('1', function (done) {
      const as = Array(1).fill(0);
      benchmark('duffEach 1', () => duffEach(as, v => v), done);
    });

    it('10', function (done) {
      const as = Array(10).fill(0);
      benchmark('duffEach 10', () => duffEach(as, v => v), done);
    });

    it('100', function (done) {
      const as = Array(100).fill(0);
      benchmark('duffEach 100', () => duffEach(as, v => v), done);
    });

    it('1000', function (done) {
      const as = Array(1000).fill(0);
      benchmark('duffEach 1000', () => duffEach(as, v => v), done);
    });

  });

  describe('duffReduce', function () {
    it('1', function (done) {
      const as = Array(1).fill(0);
      benchmark('duffReduce 1', () => duffReduce(as, v => v, 0), done);
    });

    it('10', function (done) {
      const as = Array(10).fill(0);
      benchmark('duffReduce 10', () => duffReduce(as, v => v, 0), done);
    });

    it('100', function (done) {
      const as = Array(100).fill(0);
      benchmark('duffReduce 100', () => duffReduce(as, v => v, 0), done);
    });

    it('1000', function (done) {
      const as = Array(1000).fill(0);
      benchmark('duffReduce 1000', () => duffReduce(as, v => v, 0), done);
    });

  });

});
