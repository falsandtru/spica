import { uuid } from './uuid';
import { deviation } from './statistics';

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

    it('deviation', () => {
      const str = [...Array(1e3)].map(() => uuid().replace(/^(\w+)-(\w+)-.(\w+)-.(\w+)-(\w+)$/, '$1$2$3$4$5')).join('');
      assert(/^[0-9a-f]+$/.test(str));
      const dist = [...str].reduce((d, c) => (++d[parseInt(c, 16)], d), Array(16).fill(0));
      console.debug('lib/uuid deviation', deviation(dist) / (str.length / dist.length), dist);
      assert(deviation(dist) / (str.length / dist.length) < 0.04);
    });

  });

});
