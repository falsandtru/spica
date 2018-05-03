import { Supervisor } from './supervisor.es2018';
import { Coroutine } from './coroutine';

describe('Unit: lib/supervisor.es2018', function () {
  if (navigator.userAgent.includes('Edge')) return;

  describe('Supervisor', function () {
    beforeEach(() => {
      assert(Supervisor.count === 0);
      assert(Supervisor.procs === 0);
    });

    afterEach(() => {
      assert(Supervisor.count === 0);
      assert(Supervisor.procs === 0);
    });

    it('coroutine', async function () {
      const sv = new class TestSupervisor extends Supervisor<string, number, number> { }({
        timeout: 10,
      });
      sv.register('', new Coroutine<number, number, number>(async function* () {
        assert((yield 1) === 1);
        assert((yield 2) === 2);
        return 3;
      }, { size: Infinity }));
      assert(await sv.call('', 1) === 2);
      assert(await sv.call('', 2) === 3);
      await new Promise(resolve => void setTimeout(resolve, 100));
      assert(sv.kill('') === false);
      assert(await sv.call('', 3).catch(e => e instanceof Error));
    });

  });

});
