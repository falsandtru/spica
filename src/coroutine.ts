import type { Structural, DeepImmutable, DeepRequired } from './type';
import { Array, Promise as ESPromise, Error } from './global';
import { ObjectDefineProperty, ObjectGetOwnPropertyDescriptor } from './alias';
import { tick, wait } from './clock';
import { AtomicPromise, isPromiseLike } from './promise';
import { Future, AtomicFuture } from './future';
import { Channel } from './channel';
import { extend } from './assign';
import { causeAsyncException } from './exception';
import { noop } from './noop';

export interface CoroutineOptions {
  readonly run?: boolean;
  readonly delay?: boolean;
  readonly capacity?: number;
  readonly interval?: number;
  readonly resume?: () => PromiseLike<void> | void;
  readonly trigger?: string | symbol | ReadonlyArray<string | symbol>;
}

export interface CoroutineInterface<T = unknown, R = T, _ = unknown> extends Promise<T>, AsyncIterable<R> {
  readonly constructor: {
    readonly alive: symbol;
    readonly exit: symbol;
    readonly terminate: symbol;
    readonly port: symbol;
    readonly [Symbol.species]: typeof Promise;
  };
}

const alive = Symbol.for('spica/Coroutine.alive');
const init = Symbol.for('spica/Coroutine.init');
const exit = Symbol.for('spica/Coroutine.exit');
const terminate = Symbol.for('spica/Coroutine.terminate');
const port = Symbol.for('spica/Coroutine.port');

type Reply<R, T> = (msg: IteratorResult<R, T> | PromiseLike<never>) => void;

const internal = Symbol.for('spica/coroutine::internal');

export interface Coroutine<T = unknown, R = T, S = unknown> extends AtomicPromise<T>, AsyncIterable<R> {
  constructor: typeof Coroutine;
}
export class Coroutine<T = unknown, R = T, S = unknown> extends AtomicPromise<T> implements Promise<T>, AsyncIterable<R>, CoroutineInterface<T, R, S> {
  public static readonly alive: typeof alive = alive;
  protected static readonly init: typeof init = init;
  public static readonly exit: typeof exit = exit;
  public static readonly terminate: typeof terminate = terminate;
  public static readonly port: typeof port = port;
  constructor(
    gen: (this: Coroutine<T, R, S>) => AsyncGenerator<R, T, S>,
    opts: CoroutineOptions = {},
  ) {
    super(resolve => res = resolve);
    var res!: (v: T | AtomicPromise<T>) => void;
    this[internal] = new Internal(opts);
    let count = 0;
    this[Coroutine.init] = async () => {
      const core = this[internal];
      if (!core.alive) return;
      if (count !== 0) return;
      let reply: Reply<R, T> = noop;
      try {
        const iter = gen.call(this);
        while (core.alive) {
          const [[msg, rpy]] = ++count === 1
            // Don't block.
            ? [[void 0, noop]]
            // Block.
            : await ESPromise.all([
                // Don't block.
                core.settings.capacity < 0
                  ? [void 0, noop] as const
                  : core.sendBuffer!.take() as unknown as [S, Reply<R, T>],
                // Don't block.
                ESPromise.all([
                  core.settings.resume(),
                  core.settings.interval > 0
                    ? wait(core.settings.interval)
                    : void 0,
                ]),
              ]);
          reply = rpy;
          assert(msg instanceof ESPromise === false);
          assert(msg instanceof AtomicPromise === false);
          if (!core.alive) break;
          // Block.
          // `result.value` can be a Promise value when using iterators.
          // `result.value` will never be a Promise value when using async iterators.
          const result = await iter.next(msg!);
          assert(!isPromiseLike(result.value));
          if (!result.done) {
            // Block.
            reply({ ...result });
            await core.recvBuffer.put({ ...result });
            continue;
          }
          else {
            // Don't block.
            core.alive = false;
            reply({ ...result });
            core.recvBuffer.put({ ...result });
            core.result.bind(result);
            return;
          }
        }
        assert(!core.alive);
        reply(AtomicPromise.reject(new Error(`Spica: Coroutine: Canceled.`)));
      }
      catch (reason) {
        reply(AtomicPromise.reject(reason));
        this[Coroutine.terminate](reason);
      }
    };
    const core = this[internal];
    assert(core.settings.capacity < 0 ? core.sendBuffer === void 0 : core.sendBuffer instanceof Channel);
    assert(core.settings.capacity < 0 ? core.recvBuffer instanceof BroadcastChannel : core.recvBuffer instanceof Channel);
    res(core.result.then(({ value }) => value));
    if (core.settings.trigger !== void 0) {
      for (const prop of Array<string | symbol>().concat(core.settings.trigger)) {
        if (prop in this && this.hasOwnProperty(prop)) continue;
        if (prop in this) {
          ObjectDefineProperty(this, prop, {
            set(this: Coroutine, value: unknown) {
              delete this[prop];
              this[prop] = value;
              this[init]();
            },
            get(this: Coroutine) {
              delete this[prop];
              this[init]();
              return this[prop];
            },
            enumerable: true,
            configurable: true,
          });
        }
        else {
          const desc = ObjectGetOwnPropertyDescriptor(this, prop) || {
            value: this[prop],
            enumerable: true,
            configurable: true,
            writable: true,
          };
          ObjectDefineProperty(this, prop, {
            set(this: Coroutine, value: unknown) {
              ObjectDefineProperty(this, prop, { ...desc, value });
              this[init]();
            },
            get(this: Coroutine) {
              return this[prop];
            },
            enumerable: true,
            configurable: true,
          });
        }
      }
    }
    if (this[internal].settings.run) {
      this[internal].settings.delay
        ? tick(this[Coroutine.init])
        : this[Coroutine.init]();
    }
  }
  public readonly [internal]: Internal<T, R, S>;
  public get [alive](): boolean {
    return this[internal].alive;
  }
  public readonly [init]: () => void;
  public [exit](result: T | PromiseLike<T>): void {
    if (!this[internal].alive) return;
    AtomicPromise.resolve(result)
      .then(
        result => {
          const core = this[internal];
          if (!core.alive) return;
          core.alive = false;
          // Don't block.
          core.recvBuffer.put({ value: void 0, done: true });
          core.result.bind({ value: result });
        },
        reason => {
          const core = this[internal];
          if (!core.alive) return;
          core.alive = false;
          // Don't block.
          core.recvBuffer.put({ value: void 0, done: true });
          core.result.bind(AtomicPromise.reject(reason));
        });
  }
  public [terminate](reason?: unknown): void {
    return this[exit](AtomicPromise.reject(reason));
  }
  public async *[Symbol.asyncIterator](): AsyncIterator<R, T, undefined> {
    const core = this[internal];
    const port = this[Coroutine.port];
    while (core.alive) {
      const result = await port.recv();
      if (result.done) return result.value;
      yield result.value;
    }
    return this;
  }
  public readonly [port]: Structural<Port<T, R, S>> = new Port(this);
}

class Internal<T, R, S> {
  constructor(
    public readonly opts: CoroutineOptions,
  ) {
    this.result.finally(() => {
      this.sendBuffer?.close(msgs => {
        while (msgs.length > 0) {
          // Don't block.
          const [, reply] = msgs.shift()!;
          try {
            reply(AtomicPromise.reject(new Error(`Spica: Coroutine: Canceled.`)));
          }
          catch (reason) {
            causeAsyncException(reason);
          }
        }
      });
      this.recvBuffer.close();
    });
  }
  public readonly settings: DeepImmutable<DeepRequired<CoroutineOptions>> = extend({
    run: true,
    delay: true,
    capacity: -1,
    interval: 0,
    resume: noop,
    trigger: void 0 as any,
  }, this.opts);
  public alive = true;
  public reception = 0;
  public readonly sendBuffer?: Channel<[S, Reply<R, T>]> =
    this.settings.capacity >= 0
      ? new Channel(this.settings.capacity)
      : void 0;
  public readonly recvBuffer: Channel<IteratorResult<R, T | undefined>> | BroadcastChannel<IteratorResult<R, T | undefined>> =
    this.settings.capacity >= 0
      // Block the iteration until an yielded value is consumed.
      ? new Channel(0)
      // Broadcast an yielded value.
      : new BroadcastChannel();
  public readonly result = new AtomicFuture<{ value: T }>();
}

// All responses of accepted requests must be delayed not to interrupt the current process.
class Port<T, R, S> {
  constructor(
    co: Coroutine<T, R, S>,
  ) {
    this[internal] = {
      co,
    };
  }
  public readonly [internal]: {
    readonly co: Coroutine<T, R, S>;
  };
  public ask(msg: S): Promise<IteratorResult<R, T>> {
    const core = this[internal].co[internal];
    if (!core.alive) return AtomicPromise.reject(new Error(`Spica: Coroutine: Canceled.`));
    if (core.settings.capacity < 0) return AtomicPromise.reject(new Error(`Spica: Coroutine: Overflowed.`));
    assert(core.sendBuffer instanceof Channel);
    core.settings.capacity >= 0 && core.reception === 0 && ++core.reception && core.recvBuffer.take();
    const future = new Future<IteratorResult<R, T>>();
    core.sendBuffer!.put([msg, future.bind]);
    ++core.reception;
    return ESPromise.all([future, core.recvBuffer.take()])
      .then(([result]) =>
        result.done
          ? core.result.then(({ value }) => ({ ...result, value }))
          : { ...result });
  }
  public recv(): Promise<IteratorResult<R, T>> {
    const core = this[internal].co[internal];
    if (!core.alive) return AtomicPromise.reject(new Error(`Spica: Coroutine: Canceled.`));
    ++core.reception;
    return ESPromise.resolve(core.recvBuffer.take())
      .then(result =>
        result.done
          ? core.result.then(({ value }) => ({ ...result, value }))
          : { ...result });
  }
  public send(msg: S): Promise<undefined> {
    const core = this[internal].co[internal];
    if (!core.alive) return AtomicPromise.reject(new Error(`Spica: Coroutine: Canceled.`));
    if (core.settings.capacity < 0) return AtomicPromise.reject(new Error(`Spica: Coroutine: Overflowed.`));
    assert(core.sendBuffer instanceof Channel);
    core.settings.capacity >= 0 && core.reception === 0 && ++core.reception && core.recvBuffer.take();
    const future = new Future<IteratorResult<R, T>>();
    return ESPromise.resolve(core.sendBuffer!.put([msg, future.bind]));
  }
  public connect<U>(com: (this: Coroutine<T, R, S>) => AsyncGenerator<S, U, R | T>): Promise<U> {
    const core = this[internal].co[internal];
    if (!core.alive) return AtomicPromise.reject(new Error(`Spica: Coroutine: Canceled.`));
    return (async () => {
      core.settings.capacity >= 0 && core.reception === 0 && ++core.reception && core.recvBuffer.take();
      const iter = com.call(this[internal].co);
      let reply: R | T | undefined;
      while (true) {
        const result = await iter.next(reply!);
        if (result.done) return result.value;
        reply = (await this.ask(result.value)).value;
      }
    })();
  }
}

export function isCoroutine(target: unknown): target is CoroutineInterface<unknown, unknown, unknown> {
  return typeof target === 'object'
      && target !== null
      && typeof target.constructor === 'function'
      && typeof target.constructor['alive'] === 'symbol'
      && typeof target[target.constructor['alive']] === 'boolean'
      && typeof target.constructor['init'] === 'symbol'
      && typeof target[target.constructor['init']] === 'function'
      && typeof target.constructor['exit'] === 'symbol'
      && typeof target[target.constructor['exit']] === 'function'
      && typeof target.constructor['terminate'] === 'symbol'
      && typeof target[target.constructor['terminate']] === 'function'
      && typeof target.constructor['port'] === 'symbol'
      && typeof target[target.constructor['port']] === 'object';
}

class BroadcastChannel<T> {
  public readonly [internal] = new BroadcastChannel.Internal<T>();
  public get alive(): boolean {
    return this[internal].alive;
  }
  public close(finalizer?: (msg: T[]) => void): void {
    if (!this.alive) return;
    const core = this[internal];
    const { consumers } = core;
    core.alive = false;
    for (let i = 0; consumers[i]; ++i) {
      consumers[i]?.bind(BroadcastChannel.fail());
    }
    consumers.splice(0, consumers.length);
    if (finalizer) {
      finalizer([]);
    }
  }
  public put(msg: T): AtomicPromise<undefined> {
    if (!this.alive) return BroadcastChannel.fail();
    const { consumers } = this[internal];
    while (consumers.length > 0) {
      consumers.shift()!.bind(msg);
    }
    return AtomicPromise.resolve();
  }
  public take(): AtomicPromise<T> {
    if (!this.alive) return BroadcastChannel.fail();
    const { consumers } = this[internal];
    return consumers[consumers.push(new AtomicFuture()) - 1]
      .then();
  }
}
namespace BroadcastChannel {
  export const fail = () => AtomicPromise.reject(new Error('Spica: Channel: Closed.'));
  export class Internal<T> {
    public alive: boolean = true;
    public readonly consumers: AtomicFuture<T>[] = [];
  }
}
