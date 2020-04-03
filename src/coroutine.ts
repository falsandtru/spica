import { Array, Promise, Error } from './global';
import { ObjectDefineProperty, ObjectGetOwnPropertyDescriptor } from './alias';
import { AtomicPromise, isPromiseLike } from './promise';
import { Future, AtomicFuture } from './future';
import { Channel } from './channel';
import type { Structural, DeepImmutable, DeepRequired } from './type';
import { extend } from './assign';
import { wait, tick } from './clock';
import { causeAsyncException } from './exception';
import { noop } from './noop';

export interface CoroutineOptions {
  readonly autorun?: boolean;
  readonly debug?: boolean;
  readonly sendBufferSize?: number;
  readonly recvBufferSize?: number;
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
    this[port] = new Port(this, () => void this[Coroutine.init]());
    const core = this[internal];
    assert(core.settings.sendBufferSize < 0 ? core.sendBuffer instanceof FakeChannel : core.sendBuffer instanceof Channel);
    assert(core.settings.recvBufferSize < 0 ? core.recvBuffer instanceof FakeChannel : core.recvBuffer instanceof Channel);
    void res(core.result.then(({ value }) => value));
    let cnt = 0;
    this[Coroutine.init] = async () => {
      if (cnt !== 0) return;
      const core = this[internal];
      let reply: Reply<R, T> = noop;
      try {
        if (!core.alive) return;
        const iter = gen.call(this);
        while (core.alive) {
          void ++cnt;
          const [[msg, rpy]] = cnt === 1
            // Don't block.
            ? [[void 0, noop]]
            // Block.
            : await Promise.all([
                // Don't block.
                core.settings.sendBufferSize < 0
                  ? [void 0, noop] as const
                  : core.sendBuffer.take() as unknown as [S, Reply<R, T>],
                // Don't block.
                Promise.all([
                  core.settings.resume(),
                  core.settings.interval > 0
                    ? wait(core.settings.interval)
                    : void 0,
                ]),
              ]);
          reply = rpy;
          assert(msg instanceof Promise === false);
          assert(msg instanceof AtomicPromise === false);
          if (!core.alive) break;
          // Block.
          // `result.value` can be a Promise value when using iterators.
          // `result.value` will never be a Promise value when using async iterators.
          const result = await iter.next(msg!);
          assert(!isPromiseLike(result.value));
          if (!result.done) {
            // Block.
            void reply({ ...result });
            await core.recvBuffer.put(result);
            continue;
          }
          else {
            // Don't block.
            core.alive = false;
            void reply({ ...result });
            core.recvBuffer.put(result);
            void core.result.bind(result);
            return;
          }
        }
        assert(!core.alive);
        void reply(AtomicPromise.reject(new Error(`Spica: Coroutine: Canceled.`)));
      }
      catch (reason) {
        void reply(AtomicPromise.reject(reason));
        void this[Coroutine.terminate](reason);
      }
    };
    if (core.settings.trigger !== void 0) {
      for (const prop of Array<string | symbol>().concat(core.settings.trigger)) {
        if (prop in this && this.hasOwnProperty(prop)) continue;
        if (prop in this) {
          void ObjectDefineProperty(this, prop, {
            set(this: Coroutine, value: unknown) {
              delete this[prop];
              this[prop] = value;
              void this[init]();
            },
            get(this: Coroutine) {
              delete this[prop];
              void this[init]();
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
          void ObjectDefineProperty(this, prop, {
            set(this: Coroutine, value: unknown) {
              void ObjectDefineProperty(this, prop, { ...desc, value });
              void this[init]();
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
    this[internal].settings.debug && void this[Coroutine.init]();
    this[internal].settings.autorun && void tick(this[Coroutine.init]);
  }
  public readonly [internal]: Internal<T, R, S>;
  public get [alive](): boolean {
    return this[internal].alive;
  }
  public readonly [init]: () => void;
  public [exit](result: T | PromiseLike<T>): void {
    if (!this[internal].alive) return;
    void AtomicPromise.resolve(result)
      .then(
        result => {
          const core = this[internal];
          if (!core.alive) return;
          core.alive = false;
          // Don't block.
          void core.recvBuffer.put({ value: void 0, done: true });
          void core.result.bind({ value: result });
        },
        reason => {
          const core = this[internal];
          if (!core.alive) return;
          core.alive = false;
          // Don't block.
          void core.recvBuffer.put({ value: void 0, done: true });
          void core.result.bind(AtomicPromise.reject(reason));
        });
  }
  public [terminate](reason?: unknown): void {
    return this[exit](AtomicPromise.reject(reason));
  }
  public async *[Symbol.asyncIterator](): AsyncIterator<R, T, undefined> {
    const core = this[internal];
    while (core.alive) {
      const result = await core.recvBuffer.take();
      if (result.done) break;
      yield result.value;
    }
    return this;
  }
  public readonly [port]: Structural<Port<T, R, S>>;
}

class Internal<T, R, S> {
  constructor(
    public readonly opts: CoroutineOptions,
  ) {
    void this.result.finally(() => {
      this.sendBuffer.close(msgs => {
        while (msgs.length > 0) {
          // Don't block.
          const [, reply] = msgs.shift()!;
          try {
            void reply(AtomicPromise.reject(new Error(`Spica: Coroutine: Canceled.`)));
          }
          catch (reason) {
            void causeAsyncException(reason);
          }
        }
      });
      this.recvBuffer.close();
    });
  }
  public readonly settings: DeepImmutable<DeepRequired<CoroutineOptions>> = extend({
    autorun: true,
    debug: false,
    sendBufferSize: -1,
    recvBufferSize: -1,
    interval: 0,
    resume: () => void 0,
    trigger: void 0 as any,
  }, this.opts);
  public alive = true;
  public readonly sendBuffer: Channel<[S, Reply<R, T>]> | FakeChannel<[S, Reply<R, T>]> =
    this.settings.sendBufferSize >= 0
      ? new Channel(this.settings.sendBufferSize)
      : new FakeChannel();
  public readonly recvBuffer: Channel<IteratorResult<R, T | undefined>> | FakeChannel<IteratorResult<R, T | undefined>> =
    this.settings.recvBufferSize >= 0
      ? new Channel(this.settings.recvBufferSize)
      : new FakeChannel();
  public readonly result = new AtomicFuture<{ value: T }>();
}

// All responses will be deferred.
class Port<T, R, S> {
  constructor(
    co: Coroutine<T, R, S>,
    init: () => void,
  ) {
    this[internal] = {
      co,
      init,
    };
  }
  public readonly [internal]: {
    readonly co: Coroutine<T, R, S>;
    readonly init: () => void;
  };
  public recv(): Promise<IteratorResult<R, T>> {
    const core = this[internal].co[internal];
    if (!core.alive) return AtomicPromise.reject(new Error(`Spica: Coroutine: Canceled.`));
    void this[internal].init();
    return Promise.resolve(core.recvBuffer.take())
      .then(result =>
        result.done
          ? core.result.then(({ value }) => ({ value, done: result.done }))
          : { ...result });
  }
  public send(msg: S): Promise<IteratorResult<R, T>> {
    const core = this[internal].co[internal];
    if (!core.alive) return AtomicPromise.reject(new Error(`Spica: Coroutine: Canceled.`));
    void this[internal].init();
    if (core.settings.sendBufferSize < 0) return AtomicPromise.reject(new Error(`Spica: Coroutine: Overflowed.`));
    assert(core.sendBuffer instanceof Channel);
    const ret = new Future<IteratorResult<R, T>>();
    void core.sendBuffer.put([msg, ret.bind]);
    return ret;
  }
  public async connect<U>(com: (this: Coroutine<T, R, S>) => AsyncGenerator<S, U, R | T>): Promise<U> {
    if (!this[internal].co[internal].alive) return AtomicPromise.reject(new Error(`Spica: Coroutine: Canceled.`));
    void this[internal].init();
    const iter = com.call(this[internal].co);
    let reply: R | T | undefined;
    while (true) {
      const result = await iter.next(reply!);
      if (result.done) return result.value;
      reply = (await this.send(result.value)).value;
    }
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

class FakeChannel<T> {
  public readonly [internal] = new FakeChannel.Internal<T>();
  public get alive(): boolean {
    return this[internal].alive;
  }
  public close(finalizer?: (msg: T[]) => void): void {
    if (!this.alive) return;
    const core = this[internal];
    const { consumers } = core;
    core.alive = false;
    for (let i = 0; consumers[i]; ++i) {
      consumers[i]?.bind(FakeChannel.fail());
    }
    consumers.splice(0, consumers.length);
    if (finalizer) {
      finalizer([]);
    }
  }
  public put(msg: T): AtomicPromise<undefined> {
    if (!this.alive) return FakeChannel.fail();
    const { consumers } = this[internal];
    while (consumers.length > 0) {
      consumers.shift()!.bind(msg);
    }
    return FakeChannel.success;
  }
  public take(): AtomicPromise<T> {
    if (!this.alive) return FakeChannel.fail();
    const { consumers } = this[internal];
    return consumers[consumers.push(new AtomicFuture()) - 1]
      .then();
  }
}
namespace FakeChannel {
  export const success = AtomicPromise.resolve();
  export const fail = () => AtomicPromise.reject(new Error('Spica: Channel: Closed.'));
  export class Internal<T> {
    public alive: boolean = true;
    public readonly consumers: AtomicFuture<T>[] = [];
  }
}
