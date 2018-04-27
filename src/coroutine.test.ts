import { Coroutine } from './coroutine';

describe('Unit: lib/coroutine', () => {
  if (navigator.userAgent.includes('Edge')) return;

  describe('Coroutine', () => {
    it('basic', async () => {
      assert(1 === await new Coroutine(async function* () {
        yield;
        yield Promise.resolve();
        return 1;
      }));
    });

    it('terminate', done => {
      const co = new Coroutine(async function* () {
        return 0;
      });
      co[Coroutine.terminator]();
      co[Coroutine.terminator](1);
      co.catch(done);
    });

    it('iterator', async () => {
      let cnt = 0;
      const co = new Coroutine<number, number>(async function* () {
        yield Promise.resolve(0);
        yield Promise.resolve(1);
        return 2;
      });
      for await (const n of co) {
        assert(n === cnt++);
      }
      for await (const _ of co) {
        assert(false);
      }
      assert(await co === cnt++);
    });

  });

});
