import { Supervisor } from './supervisor';
import { Coroutine } from './coroutine';

export abstract class Supervisor2018<N extends string, P = undefined, R = undefined, S = undefined> extends Supervisor<N, P, R, S> {
  public register(name: N, process: Supervisor.Process.Main<P, R, S>, state: S, reason?: any): (reason?: any) => boolean;
  public register(name: N, process: Supervisor.Process<P, R, S>, state: S, reason?: any): (reason?: any) => boolean;
  public register(name: N, process: Supervisor.Process<P, R, S> | Supervisor.Process.Main<P, R, S> | Coroutine<R, R, P>, state: S, reason?: any): (reason?: any) => boolean;
  public register(name: N, process: Supervisor.Process<P, R, S> | Supervisor.Process.Main<P, R, S> | Coroutine<R, R, P>, state: S, reason?: any): (reason?: any) => boolean {
    if (arguments.length > 3) {
      void this.kill(name, reason);
      return this.register(name, process, state);
    }
    if (process instanceof Coroutine) return this.register(
      name,
      {
        init: state => state,
        main: (param, state) =>
          (process as Coroutine<R, R, P>)[Coroutine.port].send(param)
            .then<Supervisor.Process.Result<R, S>>(({ value: reply, done }) =>
              done
                ? void this.kill(name, undefined) ||
                  (process as Coroutine<R, R, P>).then<Supervisor.Process.Result<R, S>>(reply =>
                    [reply, state])
                : [reply, state,]),
        exit: reason => void process[Coroutine.terminator](reason),
      },
      state,
      reason);
    return super.register(name, process, state);
  }
}
