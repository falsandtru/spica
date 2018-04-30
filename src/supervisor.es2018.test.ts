import { Supervisor2018 } from './supervisor.es2018';
import { Coroutine } from './coroutine';

describe('Unit: lib/supervisor.es2018', function () {
  if (navigator.userAgent.includes('Edge')) return;

  describe('Supervisor', function () {
    beforeEach(() => {
      assert(Supervisor2018.count === 0);
      assert(Supervisor2018.procs === 0);
    });

    afterEach(() => {
      assert(Supervisor2018.count === 0);
      assert(Supervisor2018.procs === 0);
    });

    it('coroutine', async function () {
      const sv = new class TestSupervisor extends Supervisor2018<string, number, number> { }({
        timeout: 10,
      });
      sv.register('', new Coroutine<never, number, number>(async function* () {
        assert((yield 1) === 1);
        assert((yield 2) === 2);
        return 3;
      }, { size: Infinity }), 0 as never);
      assert(await sv.call('', 1) === 2);
      assert(await sv.call('', 2) === 3);
      assert(sv.kill('') === false);
      assert(await sv.call('', 3).catch(e => e instanceof Error));
    });

  });

});
