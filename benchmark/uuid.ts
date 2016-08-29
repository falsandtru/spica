import {benchmark} from './benchmark';
import {IContextDefinition} from 'mocha';
import {uuid} from 'spica';

describe('Benchmark:', function (this: IContextDefinition) {
  this.timeout(10 * 1e3);

  describe('uuid', function () {
    it('gen', function (done) {
      benchmark('uuid gen', uuid, done);
    });

  });

});
