import { uuid } from './uuid';

describe('Unit: lib/uuid', () => {
  describe('v4', () => {
    it('type', () => {
      console.debug('lib/uuid', uuid());
      console.debug('lib/uuid', uuid());
      console.debug('lib/uuid', uuid());
      assert(typeof uuid() === 'string');
    });

    it('format', () => {
      assert(/^[0-9a-f-]+$/.test(uuid()));
    });

    it('size', () => {
      assert(uuid().length === 36);
    });

    it('inequality', () => {
      assert(uuid() !== uuid());
    });

  });

});
