import { select } from './select';
import { Channel } from './channel';
import { Coroutine } from './coroutine';
import { wait } from './clock';

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
      const ch = new Channel<number>();
      const gen = select({
        a: ch,
      });
      (async () => {
        await 0;
        await ch.send(0);
        ch.send(1);
        ch.send(2);
        await wait(10);
        ch.close();
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
