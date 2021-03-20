import { global, undefined } from './global';

describe('Unit: lib/global', () => {
  describe('global', () => {
    it('', () => {
      assert(global);
      assert(global.global === global);
    });
  });

  describe('undefined', () => {
    it('', () => {
      assert(undefined === void 0);
    });
  });

});
