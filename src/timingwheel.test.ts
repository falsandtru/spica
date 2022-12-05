import { TimingWheel } from './timingwheel';
import { pcg32 } from './random';

describe('Unit: lib/timingwheel', () => {
  describe('timingwheel', () => {
    it('basic', async () => {
      const r = 16;
      const wheel = new TimingWheel(0, r);

      assert(wheel.peek() === undefined);
      const nodes = [
        wheel.add(r + r / 2),
        wheel.add(r + r / 2 - 1),
        wheel.add(1),
        wheel.add(0),
        wheel.add(1),
        wheel.add(r + r / 2),
        wheel.add(r * 2 ** 4),
        wheel.add(r * 2 ** 8),
        wheel.add(r * 2 ** 16),
        wheel.add(r * 2 ** 24),
        wheel.add(r * 2 ** 32),
        wheel.add(r * 2 ** 32 + 1),
      ];
      assert(wheel.length === nodes.length);
      assert(wheel.peek() === nodes[2]);
      wheel.delete(nodes[2]);
      assert(wheel.length === nodes.length - 1);
      wheel.delete(nodes[2]);
      assert(wheel.length === nodes.length - 1);
      assert(wheel.peek() === nodes[3]);
      wheel.delete(nodes[3]);
      assert(wheel.peek() === nodes[4]);
      wheel.delete(nodes[4]);
      assert(wheel.peek() === nodes[0]);
      wheel.delete(nodes[0]);
      assert(wheel.peek() === nodes[1]);
      wheel.delete(nodes[1]);
      assert(wheel.peek() === nodes[5]);
      wheel.delete(nodes[5]);
      assert(wheel.peek() === nodes[6]);
      wheel.delete(nodes[6]);
      assert(wheel.peek() === nodes[7]);
      wheel.delete(nodes[7]);
      assert(wheel.peek() === nodes[8]);
      wheel.delete(nodes[8]);
      assert(wheel.peek() === nodes[9]);
      wheel.delete(nodes[9]);
      assert(wheel.peek() === nodes[10]);
      wheel.delete(nodes[10]);
      assert(wheel.peek() === nodes[11]);
      wheel.delete(nodes[11]);
      assert(wheel.peek() === undefined);
      assert(wheel.length === 0);
    });

    it('verify', async () => {
      const r = 16;
      const wheel = new TimingWheel<number>(0, r);

      const size = 1e4;
      const random = pcg32.random(pcg32.seed(0n, 0n));
      for (let i = 0; i < size; ++i) {
        const t = random() * 1e9 >>> 0;
        wheel.add(t, t / r >>> 0);
      }
      assert(wheel.length === size);
      for (let i = 0, s = 0; i < size; ++i) {
        const node = wheel.peek()!;
        assert(node.value >= s);
        s = node.value;
        wheel.delete(node);
      }
      assert(wheel.length === 0);
    });

  });

});
