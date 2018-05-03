import { Supervisor } from './supervisor';
import { Coroutine } from './coroutine';

abstract class Supervisor2018<N extends string, P = undefined, R = undefined, S = undefined> extends Supervisor<N, P, R, S> {
  public register(name: N, process: Coroutine<R, R, P>, state?: never, reason?: any): (reason?: any) => boolean;
  public register(name: N, process: Supervisor.Process<P, R, S> | Supervisor.Process.Main<P, R, S> | Coroutine<R, R, P>, state: S, reason?: any): (reason?: any) => boolean;
  public register(name: N, process: Supervisor.Process<P, R, S> | Supervisor.Process.Main<P, R, S> | Coroutine<R, R, P>, state: never, reason?: any): (reason?: any) => boolean {
    if (arguments.length > 3) {
      void this.kill(name, reason);
      return this.register(name, process, state);
    }
    if (process instanceof Coroutine) return this.register(
      name,
      {
        init: state => state,
        main: (param, state) =>
          process[Coroutine.port].send(param)
            .then(({ value: reply, done }) =>
              done
                ? process
                    .then(reply =>
                      void this.kill(name, undefined) ||
                      { reply, state })
                : { reply, state }),
        exit: reason => void process[Coroutine.terminator](reason),
      },
      state,
      reason);
    return super.register(name, process, state);
  }
}
export { Supervisor2018 as Supervisor };
