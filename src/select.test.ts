import { select } from './select';
import { Channel } from './channel';
import { Coroutine } from './coroutine';

describe('Unit: lib/select', function () {
  describe('select', function () {
    it('generator', async function () {
      const gen = select({
        a: async function* () { yield* [0, 2] },
        b: async function* () { yield* [1] }(),
      });
      assert.deepStrictEqual(
        await gen.next(),
        {
          value: ['a', { value: 0, done: false }],
          done: false
        });
      assert.deepStrictEqual(
        await gen.next(),
        {
          value: ['b', { value: 1, done: false }],
          done: false
        });
      assert.deepStrictEqual(
        await gen.next(),
        {
          value: ['a', { value: 2, done: false }],
          done: false
        });
      assert.deepStrictEqual(
        await gen.next(),
        {
          value: ['b', { value: undefined, done: true }],
          done: false
        });
      assert.deepStrictEqual(
        await gen.next(),
        {
          value: ['a', { value: undefined, done: true }],
          done: false
        });
      assert.deepStrictEqual(
        await gen.next(),
        {
          value: undefined,
          done: true
        });
    });

    it('channel', async function () {
      const ch1 = new Channel<number>();
      const ch2 = new Channel<number>();
      const gen = select({
        a: ch1,
        b: ch2,
      });
      (async () => {
        await 0;
        ch1.put(0);
        ch2.put(1);
        await ch1.put(2);
        ch2.close();
        ch1.close();
      })();
      assert.deepStrictEqual(
        await gen.next(),
        {
          value: ['a', { value: 0, done: false }],
          done: false
        });
      assert.deepStrictEqual(
        await gen.next(),
        {
          value: ['b', { value: 1, done: false }],
          done: false
        });
      assert.deepStrictEqual(
        await gen.next(),
        {
          value: ['a', { value: 2, done: false }],
          done: false
        });
      assert.deepStrictEqual(
        await gen.next(),
        {
          value: ['b', { value: undefined, done: true }],
          done: false
        });
      assert.deepStrictEqual(
        await gen.next(),
        {
          value: ['a', { value: undefined, done: true }],
          done: false
        });
      assert.deepStrictEqual(
        await gen.next(),
        {
          value: undefined,
          done: true
        });
    });

    it('coroutine', async function () {
      const co = new Coroutine<number>(async function* () {
        yield* [0, 1, 2];
        return 3;
      }, { size: Infinity });
      const gen = select({
        a: co,
      });
      (async () => {
        await 0;
        assert.deepStrictEqual(
          await co[Coroutine.port].send(0),
          { value: 1, done: false });
        co[Coroutine.port].send(0);
        co[Coroutine.port].send(0);
      })();
      assert.deepStrictEqual(
        await gen.next(),
        {
          value: ['a', { value: 0, done: false }],
          done: false
        });
      assert.deepStrictEqual(
        await gen.next(),
        {
          value: ['a', { value: 1, done: false }],
          done: false
        });
      assert.deepStrictEqual(
        await gen.next(),
        {
          value: ['a', { value: 2, done: false }],
          done: false
        });
      assert.deepStrictEqual(
        await gen.next(),
        {
          value: ['a', { value: 3, done: true }],
          done: false
        });
      assert.deepStrictEqual(
        await gen.next(),
        {
          value: undefined,
          done: true
        });
    });

  });

});
