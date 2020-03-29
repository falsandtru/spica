import { benchmark } from './benchmark';
import { Channel } from '../src/channel';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('Channel', function () {
    it('new', function (done) {
      benchmark('Channel new', () => new Channel(), done);
    });

    it('send/take', function (done) {
      const ch = new Channel();
      benchmark('Channel send/take', () => (ch.send(), ch.take()), done);
    });

    it('take/send', function (done) {
      const ch = new Channel();
      benchmark('Channel take/send', () => (ch.take(), ch.send()), done);
    });

    it('send/iterate', function (done) {
      const ch = new Channel();
      const iter = ch[Symbol.asyncIterator]();
      benchmark('Channel send/iterate', done => (ch.send(), iter.next().then(done)), done, { defer: true, async: true });
    });

    it('iterate/send', function (done) {
      const ch = new Channel();
      const iter = ch[Symbol.asyncIterator]();
      benchmark('Channel iterate/send', done => (iter.next(), ch.send().then(done)), done, { defer: true, async: true });
    });

  });

});
