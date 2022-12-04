import { TTL } from './ttl';
import { now } from './chrono';

describe('Unit: lib/ttl', () => {
  describe('ttl', () => {
    it('', async () => {
      const t = now(true);
      const ttl = new TTL();

      assert(ttl.peek() === undefined);
      const nodes = [
        ttl.add(t + 24),
        ttl.add(t + 23),
        ttl.add(t + 1),
        ttl.add(t + 0),
        ttl.add(t + 1),
        ttl.add(t + 24),
        ttl.add(t + 128),
      ];
      assert(ttl.length === nodes.length);
      assert(ttl.peek() === nodes[2]);
      ttl.delete(nodes[2]);
      assert(ttl.length === nodes.length - 1);
      ttl.delete(nodes[2]);
      assert(ttl.length === nodes.length - 1);
      assert(ttl.peek() === nodes[3]);
      ttl.delete(nodes[3]);
      assert(ttl.peek() === nodes[4]);
      ttl.delete(nodes[4]);
      assert(ttl.peek() === nodes[0]);
      ttl.delete(nodes[0]);
      assert(ttl.peek() === nodes[1]);
      ttl.delete(nodes[1]);
      assert(ttl.peek() === nodes[5]);
      ttl.delete(nodes[5]);
      assert(ttl.peek() === nodes[6]);
      ttl.delete(nodes[6]);
      assert(ttl.peek() === undefined);
      assert(ttl.length === 0);
    });

  });

});
