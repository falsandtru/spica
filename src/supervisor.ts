import { Supervisor } from './supervisor.legacy';
import { Coroutine, CoroutineInterface } from './coroutine';
import { isObject } from './type';

abstract class Supervisor2018<N extends string, P = unknown, R = unknown, S = unknown> extends Supervisor<N, P, R, S> {
  public register(name: N, process: Supervisor.Process<P, R, S> | Supervisor.Process.Main<P, R, S> | CoroutineInterface<R, R, P>, state: S, reason?: unknown): (reason?: unknown) => boolean;
  public register(name: N, process: CoroutineInterface<R, R, P>, state?: never, reason?: unknown): (reason?: unknown) => boolean;
  public register(name: N, process: Supervisor.Process<P, R, S> | Supervisor.Process.Main<P, R, S> | CoroutineInterface<R, R, P>, state: never, reason?: unknown): (reason?: unknown) => boolean {
    if (arguments.length > 3) {
      void this.kill(name, reason);
      return this.register(name, process, state);
    }
    if (isCoroutine(process)) {
      const proc: Supervisor.Process<P, R, S> = {
        init: state => state,
        main: (param, state, kill) =>
          process[Coroutine.port].send(param)
            .then(({ value: reply, done }: IteratorResult<R, R>) =>
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
  public [Coroutine.terminator](reason?: unknown): void {
    void this.terminate(reason);
  }
}
namespace Supervisor2018 {
  export import Process = Supervisor.Process;
  export import Callback = Supervisor.Callback;
  export import Event = Supervisor.Event;
}
interface Supervisor2018<N extends string, P = unknown, R = unknown, S = unknown> extends Coroutine<undefined> { }
Supervisor['__proto__'] = Coroutine;
Supervisor.prototype['__proto__'] = Coroutine.prototype;
export { Supervisor2018 as Supervisor };

function isCoroutine(target: unknown): target is CoroutineInterface<unknown, unknown, unknown> {
  return isObject(target)
      && typeof target.constructor['port'] === 'symbol'
      && typeof target[target.constructor['port']] === 'object'
      && typeof target.constructor['terminator'] === 'symbol'
      && typeof target[target.constructor['terminator']] === 'function';
}
