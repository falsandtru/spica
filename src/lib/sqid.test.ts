import {sqid} from './sqid';

describe('Unit: lib/sqid', () => {
  describe('sqid', () => {
    it('type', () => {
      assert(typeof sqid() === 'string');
      assert(typeof sqid(0) === 'string');
      assert(typeof sqid(1) === 'string');
    });

    it('format', () => {
      assert(/^[0-9]{15}$/.test(sqid()));
      assert(/^[0-9]{15}$/.test(sqid(0)));
      assert(/^[0-9]{15}$/.test(sqid(1)));
    });

    it('inequality', () => {
      assert(sqid() !== sqid());
    });

    it('equality', () => {
      assert(sqid(0) === '000000000000000');
      assert(sqid(1) === '000000000000001');
    });

  });

});
