import { TTL } from './ttl';
import { pcg32 } from './random';
import { now } from './chrono';

describe('Unit: lib/ttl', () => {
  describe('ttl', () => {
    it('basic', async () => {
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

    it('verify', async () => {
      const ttl = new TTL<number>();

      const size = 1e4;
      const random = pcg32.random(pcg32.seed(0n, 0n));
      for (let i = 0, n = now(); i < size; ++i) {
        const r = random() * 1e9 | 0;
        ttl.add(n + r, r / 16 >>> 0);
      }
      assert(ttl.length === size);
      for (let i = 0, s = 0; i < size; ++i) {
        const node = ttl.peek()!;
        assert(node.value >= s);
        s = node.value;
        ttl.delete(node);
      }
      assert(ttl.length === 0);
    });

  });

});
