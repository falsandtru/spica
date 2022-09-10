import { benchmark } from './benchmark';
import { Channel } from '../src/channel';

describe('Benchmark:', function () {
  describe('Channel', function () {
    it('new', function (done) {
      benchmark('Channel new', () => new Channel(), done);
    });

    it('0 put/take', function (done) {
      const ch = new Channel();
      benchmark('Channel 0 put/take', () => (ch.put(), ch.take()), done);
    });

    it('1 put/take', function (done) {
      const ch = new Channel(1);
      benchmark('Channel 1 put/take', () => (ch.put(), ch.take()), done);
    });

    it('0 take/put', function (done) {
      const ch = new Channel();
      benchmark('Channel 0 take/put', () => (ch.take(), ch.put()), done);
    });

    it('1 take/put', function (done) {
      const ch = new Channel(1);
      benchmark('Channel 1 take/put', () => (ch.take(), ch.put()), done);
    });

    it('0 put/iterate', function (done) {
      const ch = new Channel();
      const iter = ch[Symbol.asyncIterator]();
      benchmark('Channel 0 put/iterate', done => (ch.put(), iter.next().then(done)), done, { defer: true });
    });

    it('1 put/iterate', function (done) {
      const ch = new Channel(1);
      const iter = ch[Symbol.asyncIterator]();
      benchmark('Channel 1 put/iterate', done => (ch.put(), iter.next().then(done)), done, { defer: true });
    });

    it('0 iterate/put', function (done) {
      const ch = new Channel();
      const iter = ch[Symbol.asyncIterator]();
      benchmark('Channel 0 iterate/put', done => (iter.next(), ch.put().then(done)), done, { defer: true });
    });

    it('1 iterate/put', function (done) {
      const ch = new Channel(1);
      const iter = ch[Symbol.asyncIterator]();
      benchmark('Channel 1 iterate/put', done => (iter.next(), ch.put().then(done)), done, { defer: true });
    });

  });

});
