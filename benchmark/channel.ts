import { benchmark } from './benchmark';
import { Channel } from '../src/channel';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('Channel', function () {
    it('new', function (done) {
      benchmark('Channel new', () => new Channel(), done);
    });

    it('put/take', function (done) {
      const ch = new Channel();
      benchmark('Channel put/take', () => (ch.put(), ch.take()), done);
    });

    it('take/put', function (done) {
      const ch = new Channel();
      benchmark('Channel take/put', () => (ch.take(), ch.put()), done);
    });

    it('put/iterate', function (done) {
      const ch = new Channel();
      const iter = ch[Symbol.asyncIterator]();
      benchmark('Channel put/iterate', done => (ch.put(), iter.next().then(done)), done, { defer: true, async: true });
    });

    it('iterate/put', function (done) {
      const ch = new Channel();
      const iter = ch[Symbol.asyncIterator]();
      benchmark('Channel iterate/put', done => (iter.next(), ch.put().then(done)), done, { defer: true, async: true });
    });

  });

});
