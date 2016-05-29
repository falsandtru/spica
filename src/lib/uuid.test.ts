import {v4} from './uuid';

describe('Unit: lib/uuid', () => {
  describe('v4', () => {
    it('type', () => {
      console.log('lib/uuid', v4());
      console.log('lib/uuid', v4());
      console.log('lib/uuid', v4());
      assert(typeof v4() === 'string');
    });

    it('format', () => {
      assert(/^[0-9a-f-]+$/.test(v4()));
    });

    it('size', () => {
      assert(v4().length === 36);
    });

    it('inequality', () => {
      assert(v4() !== v4());
    });

  });

});
