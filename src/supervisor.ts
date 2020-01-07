import { Supervisor } from './supervisor.legacy';
import { Coroutine, CoroutineInterface, isCoroutine } from './coroutine';

abstract class Supervisor2018<N extends string, P = unknown, R = unknown, S = unknown> extends Supervisor<N, P, R, S> {
  public register(name: N, process: Supervisor2018.Process<P, R, S>, state: S, reason?: unknown): (reason?: unknown) => boolean;
  public register(name: N, process: Supervisor2018.Process.Generator<P, R> | Supervisor2018.Process.AsyncGenerator<P, R> | Supervisor2018.Process.Coroutine<P, R>, state?: never, reason?: unknown): (reason?: unknown) => boolean;
  public register(name: N, process: Supervisor2018.Process<P, R, S>, state: never, reason?: unknown): (reason?: unknown) => boolean {
    if (arguments.length > 3) {
      void this.kill(name, reason);
      return this.register(name, process, state);
    }
    if (isCoroutine(process)) {
      const proc: Supervisor2018.Process<P, R, S> = {
        init: state => state,
        main: (param, state, kill) =>
          process[Coroutine.port].send(param)
            .then(({ value: reply, done }: IteratorResult<R, R>) =>
              done && void kill() || { reply, state }),
        exit: reason => void process[Coroutine.terminate](reason),
      };
      void Supervisor2018.standalone.add(proc);
      const kill = this.register(name, proc, state, reason);
      void process.catch(kill);
      return kill;
    }
    if (isAsyncGeneratorFunction(process)) {
      const iter = process();
      const kill: () => boolean = this.register(
        name,
        {
          init: state => (void iter.next().catch(kill), state),
          main: (param, state, kill) => {
            return iter.next(param)
              .then(({ value: reply, done }) => {
                done && void kill();
                return [reply, state];
              });
          },
          exit: _ => undefined
        },
        state);
      return kill;
    }
    return super.register(name, process as Exclude<typeof process, Supervisor2018.Process.AsyncGenerator<P, R>>, state);

    function isAsyncGeneratorFunction(process: Supervisor2018.Process<P, R, S>): process is Supervisor2018.Process.AsyncGenerator<P, R> {
      return process[Symbol.toStringTag] === 'AsyncGeneratorFunction';
    }
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
  export type Process<P, R, S> =
    | Supervisor.Process<P, R, S>
    | Process.AsyncGenerator<P, R>
    | Process.Coroutine<P, R>;
  export namespace Process {
    export type Regular<P, R, S> = Supervisor.Process.Regular<P, R, S>;
    export type Callback<P, R, S> = Supervisor.Process.Callback<P, R, S>;
    export type Generator<P, R> = Supervisor.Process.Generator<P, R>;
    export type AsyncGenerator<P, R> = () => global.AsyncGenerator<R, R, P>;
    export type Coroutine<P, R> = CoroutineInterface<R, R, P>;
    export type Result<R, S> = Supervisor.Process.Result<R, S>;
  }
  export import Callback = Supervisor.Callback;
  export import Event = Supervisor.Event;
}
interface Supervisor2018<N extends string, P = unknown, R = unknown, S = unknown> extends Coroutine<undefined, undefined, [N | ('' extends N ? undefined | ((names: Iterable<N>) => Iterable<N>) : never), P, (Supervisor2018.Callback<R> | number)?, number?]> { }
Supervisor['__proto__'] = Coroutine;
Supervisor.prototype['__proto__'] = Coroutine.prototype;
export { Supervisor2018 as Supervisor };
