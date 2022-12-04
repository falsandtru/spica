import { TTL } from './ttl';
import { now } from './chrono';

describe('Unit: lib/ttl', () => {
  describe('ttl', () => {
    it('', async () => {
      const r = 16;
      const t = now(true);
      const ttl = new TTL(r);

      assert(ttl.peek() === undefined);
      const nodes = [
        ttl.add(t + r + r / 2),
        ttl.add(t + r + r / 2 - 1),
        ttl.add(t + 1),
        ttl.add(t + 0),
        ttl.add(t + 1),
        ttl.add(t + r + r / 2),
        ttl.add(t + r * 2 ** 4),
        ttl.add(t + r * 2 ** 8),
        ttl.add(t + r * 2 ** 16),
        ttl.add(t + r * 2 ** 24),
        ttl.add(t + r * 2 ** 32),
        ttl.add(t + r * 2 ** 32 + 1),
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
      assert(ttl.peek() === nodes[7]);
      ttl.delete(nodes[7]);
      assert(ttl.peek() === nodes[8]);
      ttl.delete(nodes[8]);
      assert(ttl.peek() === nodes[9]);
      ttl.delete(nodes[9]);
      assert(ttl.peek() === nodes[10]);
      ttl.delete(nodes[10]);
      assert(ttl.peek() === nodes[11]);
      ttl.delete(nodes[11]);
      assert(ttl.peek() === undefined);
      assert(ttl.length === 0);
    });

  });

});
