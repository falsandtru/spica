import { Supervisor } from './supervisor.legacy';
import { Coroutine, CoroutineInterface, isCoroutine } from './coroutine';

interface Supervisor2018<N extends string, P = unknown, R = unknown, S = unknown> extends Coroutine<undefined, undefined, [N | ('' extends N ? undefined | ((names: Iterable<N>) => Iterable<N>) : never), P, (Supervisor2018.Callback<R> | number)?, number?]> {
  constructor: typeof Supervisor2018 & typeof Coroutine;
}
abstract class Supervisor2018<N extends string, P = unknown, R = unknown, S = unknown> extends Supervisor<N, P, R, S> {
  // Workaround for #36053
  public register(this: Supervisor2018<N, P, R, void>, name: N, process: Supervisor2018.Process.Function<P, R, S>, state?: S, reason?: unknown): (reason?: unknown) => boolean;
  // Workaround for #36053
  public register(name: N, process: Supervisor2018.Process.Function<P, R, S>, state: S, reason?: unknown): (reason?: unknown) => boolean;
  public register(this: Supervisor2018<N, P, R, void>, name: N, process: Supervisor2018.Process<P, R, S>, state?: S, reason?: unknown): (reason?: unknown) => boolean;
  public register(name: N, process: Supervisor2018.Process<P, R, S>, state: S, reason?: unknown): (reason?: unknown) => boolean;
  public register(name: N, process: Supervisor2018.Process.Coroutine<P, R>, state?: never, reason?: unknown): (reason?: unknown) => boolean;
  public register(name: N, process: Supervisor2018.Process<P, R, S>, state?: S, reason?: unknown): (reason?: unknown) => boolean {
    state = state!;
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
      void this.constructor.standalone.add(proc);
      const kill = this.register(name, proc, state, reason);
      void process.catch(kill);
      return kill;
    }
    if (isAsyncGeneratorFunction(process)) {
      const iter = process(state);
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
    return super.register(name, process as Exclude<typeof process, Supervisor2018.Process.AsyncGeneratorFunction<P, R, S>>, state);

    function isAsyncGeneratorFunction(process: Supervisor2018.Process<P, R, S>): process is Supervisor2018.Process.AsyncGeneratorFunction<P, R, S> {
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
    | Process.AsyncGeneratorFunction<P, R, S>
    | Process.Coroutine<P, R>;
  export namespace Process {
    export type Regular<P, R, S> = Supervisor.Process.Regular<P, R, S>;
    export type Function<P, R, S> = Supervisor.Process.Function<P, R, S>;
    export type GeneratorFunction<P, R, S> = Supervisor.Process.GeneratorFunction<P, R, S>;
    export type AsyncGeneratorFunction<P, R, S> = (state: S) => global.AsyncGenerator<R, R, P>;
    export type Coroutine<P, R> = CoroutineInterface<R, R, P>;
    export type Result<R, S> = Supervisor.Process.Result<R, S>;
  }
  export import Callback = Supervisor.Callback;
  export import Event = Supervisor.Event;
}
Supervisor['__proto__'] = Coroutine;
Supervisor.prototype['__proto__'] = Coroutine.prototype;
export { Supervisor2018 as Supervisor };
