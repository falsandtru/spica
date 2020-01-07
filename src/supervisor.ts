import { Supervisor } from './supervisor.legacy';
import { Coroutine, CoroutineInterface, isCoroutine } from './coroutine';

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
              done && void kill() || { reply, state }),
        exit: reason => void process[Coroutine.terminate](reason),
      };
      void Supervisor.standalone.add(proc);
      const kill = this.register(name, proc, state, reason);
      void process.catch(kill);
      return kill;
    }
    return super.register(name, process, state);
  }
  public terminate(reason?: unknown): boolean {
    const result = super.terminate(reason);
    void this[Coroutine.exit](undefined);
    return result;
  }
  public [Coroutine.terminate](reason?: unknown): void {
    void this.terminate(reason);
  }
  public [Coroutine.port] = {
    recv: () => { throw new Error(`Spica: Supervisor: <${this.id}/${this.name}>: Cannot use coroutine port.`); },
    send: () => { throw new Error(`Spica: Supervisor: <${this.id}/${this.name}>: Cannot use coroutine port.`); },
    connect: () => { throw new Error(`Spica: Supervisor: <${this.id}/${this.name}>: Cannot use coroutine port.`); },
  } as const;
}
namespace Supervisor2018 {
  export import Process = Supervisor.Process;
  export import Callback = Supervisor.Callback;
  export import Event = Supervisor.Event;
}
interface Supervisor2018<N extends string, P = unknown, R = unknown, S = unknown> extends Coroutine<undefined, undefined, [N | ('' extends N ? undefined | ((names: Iterable<N>) => Iterable<N>) : never), P, (Supervisor.Callback<R> | number)?, number?]> { }
Supervisor['__proto__'] = Coroutine;
Supervisor.prototype['__proto__'] = Coroutine.prototype;
export { Supervisor2018 as Supervisor };
