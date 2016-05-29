import {FINGERPRINT} from './fingerprint';

describe('Unit: lib/fingerprint', () => {
  describe('fingerprint', () => {
    it('type', () => {
      console.log('lib/fingerprint', FINGERPRINT);
      assert(typeof FINGERPRINT === 'number');
      assert(!isNaN(FINGERPRINT));
      assert(FINGERPRINT === parseInt(FINGERPRINT.toString(), 10));
    });

    it('size', () => {
      assert(0 < FINGERPRINT && FINGERPRINT < 1e15);
    });

  });

});
