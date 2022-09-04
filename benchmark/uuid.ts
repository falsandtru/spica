import { benchmark } from './benchmark';
import { uuid } from '../src/uuid';

describe('Benchmark:', function () {
  describe('uuid', function () {
    it('gen', function (done) {
      benchmark('uuid gen', uuid, done);
    });

  });

});
