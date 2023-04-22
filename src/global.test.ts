import global from './global';

describe('Unit: lib/global', () => {
  describe('global', () => {
    it('', () => {
      assert(global === globalThis);
      assert(global.global === globalThis);
    });
  });

});
