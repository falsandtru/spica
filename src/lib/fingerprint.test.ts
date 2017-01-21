import {FINGERPRINT} from './fingerprint';

describe('Unit: lib/fingerprint', () => {
  describe('fingerprint', () => {
    it('type', () => {
      console.log('lib/fingerprint', FINGERPRINT);
      assert(typeof FINGERPRINT === 'number');
      assert(!isNaN(FINGERPRINT));
    });

    it('size', () => {
      assert(0 < FINGERPRINT && FINGERPRINT < 1e9);
      assert(FINGERPRINT === (FINGERPRINT | 0));
    });

  });

});
