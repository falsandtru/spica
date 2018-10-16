import { Supervisor } from './supervisor.legacy';
import { Coroutine } from './coroutine';

abstract class Supervisor2018<N extends string, P = void, R = void, S = void> extends Supervisor<N, P, R, S> {
  public register(name: N, process: Supervisor.Process<P, R, S> | Supervisor.Process.Main<P, R, S> | Coroutine<R, R, P>, state: S, reason?: any): (reason?: any) => boolean;
  public register(name: N, process: Coroutine<R, R, P>, state?: never, reason?: any): (reason?: any) => boolean;
  public register(name: N, process: Supervisor.Process<P, R, S> | Supervisor.Process.Main<P, R, S> | Coroutine<R, R, P>, state: never, reason?: any): (reason?: any) => boolean {
    if (arguments.length > 3) {
      void this.kill(name, reason);
      return this.register(name, process, state);
    }
    if (process instanceof Coroutine) {
      const proc: Supervisor.Process<P, R, S> = {
        init: state => state,
        main: (param, state, kill) =>
          process[Coroutine.port].send(param)
            .then(({ value: reply, done }) =>
              done
                ? process
                    .then(reply =>
                      void kill() ||
                      { reply, state })
                : { reply, state }),
        exit: reason => void process[Coroutine.terminator](reason),
      };
      void Supervisor.standalone.add(proc);
      const kill = this.register(name, proc, state, reason);
      void process.catch(kill);
      return kill;
    }
    return super.register(name, process, state);
  }
}
namespace Supervisor2018 {
  export import Process = Supervisor.Process;
  export import Callback = Supervisor.Callback;
  export import Event = Supervisor.Event;
}
export { Supervisor2018 as Supervisor };
