import { Copropagator } from './copropagator';
import { Coroutine } from './coroutine';
import { never } from './clock';

describe('Unit: lib/copropagator', () => {
  describe('Copropagator', () => {
    it('exit', () => {
      let cnt = 0;
      const co = new Copropagator([
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
      const co = new Copropagator([
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

  });

});
