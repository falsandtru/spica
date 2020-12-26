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

    it('distribution', () => {
      const rs = [...Array(99)].map(() => uuid().replace(/^(\w+)-(\w+)-.(\w+)-.(\w+)-(\w+)$/, '$1$2$3$4$5')).join('').split('')
      const dist = rs.reduce((d, c) => (++d[parseInt(c, 16)], d), Array<0>(16).fill(0));
      console.debug('lib/uuid distribution', dist);
      assert(dist[0] > dist[dist.length / 2 | 0] / 2);
      assert(dist[dist.length - 1] > dist[dist.length / 2 | 0] / 2);
    });

  });

});
