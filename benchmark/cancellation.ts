import { benchmark } from './benchmark';
import { Cancellation } from '../src/cancellation';

describe('Benchmark:', function () {
  describe('Cancellation', function () {
    it('new', function (done) {
      benchmark('Cancellation new', () => new Cancellation(), done);
    });

    it('register 1', function (done) {
      benchmark('Cancellation register 1', () => {
        const c = new Cancellation();
        c.register(() => 0);
      }, done);
    });

    it('register 3', function (done) {
      benchmark('Cancellation register 3', () => {
        const c = new Cancellation();
        c.register(() => 0);
        c.register(() => 0);
        c.register(() => 0);
      }, done);
    });

    it('register 5', function (done) {
      benchmark('Cancellation register 5', () => {
        const c = new Cancellation();
        c.register(() => 0);
        c.register(() => 0);
        c.register(() => 0);
        c.register(() => 0);
        c.register(() => 0);
      }, done);
    });

    it('cancel 1', function (done) {
      benchmark('Cancellation cancel 1', () => {
        const c = new Cancellation();
        c.register(() => 0);
        c.cancel();
      }, done);
    });

    it('cancel 3', function (done) {
      benchmark('Cancellation cancel 3', () => {
        const c = new Cancellation();
        c.register(() => 0);
        c.register(() => 0);
        c.register(() => 0);
        c.cancel();
      }, done);
    });

    it('cancel 5', function (done) {
      benchmark('Cancellation cancel 5', () => {
        const c = new Cancellation();
        c.register(() => 0);
        c.register(() => 0);
        c.register(() => 0);
        c.register(() => 0);
        c.register(() => 0);
        c.cancel();
      }, done);
    });

  });

});
