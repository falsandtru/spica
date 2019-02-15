import { benchmark } from './benchmark';
import { Coroutine } from '..';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('Coroutine', function () {
    it('new', function (done) {
      benchmark('Coroutine new', () => new Coroutine(function* () { return undefined; }), done);
    });

  });

});
