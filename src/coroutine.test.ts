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
      co.terminate();
      co.terminate(1);
      co.catch(done);
    });

  });

});
