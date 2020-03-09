import { sqid } from './sqid';

describe('Unit: lib/sqid', () => {
  describe('sqid', () => {
    it('type', () => {
      assert(typeof sqid() === 'string');
      assert(typeof sqid(0) === 'string');
      assert(typeof sqid(1) === 'string');
      assert(typeof sqid(1e15) === 'string');
    });

    it('format', () => {
      assert(/^[0-9]{16}$/.test(sqid()));
      assert(/^[0-9]{16}$/.test(sqid(0)));
      assert(/^[0-9]{16}$/.test(sqid(1)));
      assert(/^[0-9]{16}$/.test(sqid(1e15)));
    });

    it('validation', () => {
      assert.throws(() => sqid(undefined as any));
      assert.throws(() => sqid(NaN));
      assert.throws(() => sqid(-1));
      assert.throws(() => sqid(0.1));
    });

    it('inequality', () => {
      assert(sqid() !== sqid());
    });

    it('equality', () => {
      assert(sqid(0) === '0000000000000000');
      assert(sqid(1) === '0000000000000001');
      assert(sqid(1e15) === '1000000000000000');
    });

  });

});
