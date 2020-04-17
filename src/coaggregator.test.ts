import { Coaggregator } from './coaggregator';
import { Coroutine } from './coroutine';
import { never } from './clock';

describe('Unit: lib/coaggregator', () => {
  describe('Coaggregator', () => {
    it('exit', () => {
      let cnt = 0;
      const co = new Coaggregator([
        new Coroutine(async function* () {
          this.then(reason => {
            assert(reason === 0);
            assert(cnt === 0 && ++cnt);
          });
          return never;
        }, { delay: false }),
        new Coroutine(async function* () {
          this.then(reason => {
            assert(reason === 0);
            assert(cnt === 1 && ++cnt);
          });
          return never;
        }, { delay: false }),
      ]);
      co.then(reason => {
        assert(reason === 0);
        assert(cnt === 2 && ++cnt);
      });
      co[Coroutine.exit](0);
      assert(cnt === 3 && ++cnt);
    });

    it('terminate', () => {
      let cnt = 0;
      const co = new Coaggregator([
        new Coroutine(async function* () {
          this.catch(reason => {
            assert(reason === 0);
            assert(cnt === 0 && ++cnt);
          });
          return never;
        }, { delay: false }),
        new Coroutine(async function* () {
          this.catch(reason => {
            assert(reason === 0);
            assert(cnt === 1 && ++cnt);
          });
          return never;
        }, { delay: false }),
      ]);
      co.catch(reason => {
        assert(reason === 0);
        assert(cnt === 2 && ++cnt);
      });
      co[Coroutine.terminate](0);
      assert(cnt === 3 && ++cnt);
    });

    it('iterate', async () => {
      const co = new Coaggregator([
        new Coroutine<number>(async function* () {
          yield* [0, 2];
          return 4;
        }),
        new Coroutine<number>(async function* () {
          yield* [1];
          return 3;
        }),
      ]);
      const gen = co[Symbol.asyncIterator]();
      assert.deepStrictEqual(
        await gen.next(),
        {
          value: 0,
          done: false
        });
      assert.deepStrictEqual(
        await gen.next(),
        {
          value: 1,
          done: false
        });
      assert.deepStrictEqual(
        await gen.next(),
        {
          value: 2,
          done: false
        });
      assert.deepStrictEqual(
        await gen.next(),
        {
          value: 4,
          done: true
        });
      assert(await co === 4);
    });

  });

});
