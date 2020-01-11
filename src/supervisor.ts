import { Supervisor, SupervisorOptions } from './supervisor.legacy';
import { Coroutine, CoroutineInterface, isCoroutine } from './coroutine';
import { AtomicPromise } from './promise';

interface Supervisor2018<N extends string, P = undefined, R = P, S = undefined> extends Coroutine<undefined, undefined, undefined> {
  constructor: typeof Supervisor2018 & typeof Coroutine;
}
abstract class Supervisor2018<N extends string, P = undefined, R = P, S = undefined> extends Supervisor<N, P, R, S> {
  constructor(opts: SupervisorOptions = {}) {
    super(opts);
    void this[Coroutine.init]();
  }
  // Workaround for #36053
  public register(this: Supervisor2018<N, P, R, undefined>, name: N, process: Supervisor2018.Process.Function<P, R, S>, state?: S): (reason?: unknown) => boolean;
  public register(name: N, process: Supervisor2018.Process.Function<P, R, S>, state: S): (reason?: unknown) => boolean;
  public register(this: Supervisor2018<N, P, R, undefined>, name: N, process: Supervisor2018.Process.GeneratorFunction<P, R, S>, state?: S): (reason?: unknown) => boolean;
  public register(name: N, process: Supervisor2018.Process.GeneratorFunction<P, R, S>, state: S): (reason?: unknown) => boolean;
  public register(this: Supervisor2018<N, P, R, undefined>, name: N, process: Supervisor2018.Process.AsyncGeneratorFunction<P, R, S>, state?: S): (reason?: unknown) => boolean;
  public register(name: N, process: Supervisor2018.Process.AsyncGeneratorFunction<P, R, S>, state: S): (reason?: unknown) => boolean;
  public register(name: N, process: Supervisor2018.Process.Coroutine<P, R>, state?: never): (reason?: unknown) => boolean;
  public register(name: N, process: Supervisor2018.Process<P, R, S>, state: S): (reason?: unknown) => boolean;
  public register(name: N, process: Supervisor2018.Process<P, R, S>, state?: S): (reason?: unknown) => boolean {
    state = state!;
    if (isCoroutine(process)) {
      const proc: Supervisor2018.Process.Regular<P, R, S> = {
        init: state => state,
        main: (param, state, kill) =>
          (process[Coroutine.port] as Coroutine<R, R, P>[typeof Coroutine.port]).send(param)
            .then(({ value: reply, done }) =>
              done && void kill() || [reply, state]),
        exit: reason => void process[Coroutine.terminate](reason),
      };
      void this.constructor.standalone.add(proc);
      const kill = this.register(name, proc, state);
      void process.catch(kill);
      return kill;
    }
    if (isAsyncGeneratorFunction(process)) {
      let iter: AsyncGenerator<R, R, P>;
      return this.register(
        name,
        {
          init: (state, kill) => (iter = process(state, kill), void iter.next().catch(kill), state),
          main: (param, state, kill) =>
            AtomicPromise.resolve(iter.next(param))
              .then(({ value: reply, done }) =>
                done && void kill() || [reply, state]),
          exit: () => undefined
        },
        state);
    }
    return super.register(name, process, state);

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
  export type Process<P, R = P, S = undefined> =
    | Supervisor.Process<P, R, S>
    | Process.AsyncGeneratorFunction<P, R, S>
    | Process.Coroutine<P, R>;
  export namespace Process {
    export type Regular<P, R, S> = Supervisor.Process.Regular<P, R, S>;
    export type Function<P, R, S> = Supervisor.Process.Function<P, R, S>;
    export type GeneratorFunction<P, R, S> = Supervisor.Process.GeneratorFunction<P, R, S>;
    export type AsyncGeneratorFunction<P, R, S> = (state: S, kill: (reason?: unknown) => void) => global.AsyncGenerator<R, R, P>;
    export type Coroutine<P, R> = CoroutineInterface<R, R, P>;
    export type Result<R, S> = Supervisor.Process.Result<R, S>;
  }
  export import Callback = Supervisor.Callback;
  export import Event = Supervisor.Event;
}
Supervisor['__proto__'] = Coroutine;
Supervisor.prototype['__proto__'] = Coroutine.prototype;
export { Supervisor2018 as Supervisor };
