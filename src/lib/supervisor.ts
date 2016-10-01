import {Supervisor as ISupervisor, SupervisorSettings} from 'spica';
import {Observable} from './observable';
import {DataMap} from './collection/datamap';
import {Tick} from './tick';
import {isThenable} from './thenable';
import {concat} from './concat';
import {noop} from './noop';

interface WorkerSharedResources<T extends string[], D, R> {
  procs: Observable<T, WorkerCommand<T, D>, R>;
  dependenciesStack: T[];
  allRefsCache?: [T, (data: WorkerCommand<T, D>) => R, boolean][];
}

export namespace Supervisor {
  export namespace Event {
    export namespace Data {
      export type Exec<T extends string[], D, R> = ISupervisor.Event.Data.Exec<T, D, R>;
      export type Fail<T extends string[], D> = ISupervisor.Event.Data.Fail<T, D>;
      export type Loss<T extends string[], D> = ISupervisor.Event.Data.Loss<T, D>;
      export type Exit<T extends string[], D, R> = ISupervisor.Event.Data.Exit<T, D, R>;
    }
  }
}

export abstract class Supervisor<T extends string[], D, R> implements ISupervisor<T, D, R> {
  public static count: number = 0;
  public static procs: number = 0;
  constructor({
    name = '',
    dependencies = [],
    retry = false,
    timeout = 0,
    destructor = noop
  }: SupervisorSettings<T> = {}) {
    if (this.constructor === Supervisor) throw new Error('Spica: Supervisor: Cannot instantiate abstract classes.');
    this.name = name;
    void dependencies.reduce<void>((_, [namespace, deps]) => void this.deps.set(namespace, deps), void 0);
    this.retry = retry;
    this.timeout = timeout;
    this.destructor_ = destructor;
    void ++(<typeof Supervisor>this.constructor).count;
  }
  private destructor(reason: any): void {
    void this.checkState();
    assert(this.registerable === false);
    this.alive = false;
    assert(this.procs.refs(<T><any[]>[]).length === 0);
    while (this.queue.length > 0) {
      const [namespace, data] = this.queue.shift()!;
      void this.events.loss.emit(namespace, [namespace, data]);
    }
    try {
      void this.destructor_(reason);
    }
    catch (err) {
      void console.error(err);
      assert(!console.info(err + ''));
    }
    void --(<typeof Supervisor>this.constructor).count;
    void Object.freeze(this);
  }
  public readonly name: string;
  private readonly deps: DataMap<T, T[]> = new DataMap<T, T[]>();
  private readonly retry: boolean;
  private readonly timeout: number;
  private readonly destructor_: (reason?: any) => any;
  public readonly events = {
    exec: new Observable<T, Supervisor.Event.Data.Exec<T, D, R>, any>(),
    fail: new Observable<T, Supervisor.Event.Data.Fail<T, D>, any>(),
    loss: new Observable<T, Supervisor.Event.Data.Loss<T, D>, any>(),
    exit: new Observable<T, Supervisor.Event.Data.Exit<T, D, R>, any>()
  };
  private readonly procs: Observable<T, WorkerCommand<T, D>, R> = new Observable<T, WorkerCommand<T, D>, R>();
  private alive = true;
  private registerable = true;
  private scheduled = false;
  public schedule(): void {
    if (!this.alive) return;
    if (this.scheduled) return;
    void Tick(_ => {
      if (!this.alive) return;
      this.scheduled = false;
      void this.drain();
    });
    this.scheduled = true;
  }
  private readonly workerSharedResource: WorkerSharedResources<T, D, R> = {
    procs: this.procs,
    dependenciesStack: []
  };
  public register(namespace: T, process: (data: D) => R): (reason?: any) => void {
    void this.checkState();
    if (!this.registerable) throw new Error(`Spica: Supervisor: Supervisor ${this.name} cannot register process during the exiting.`);
    namespace = <T>concat([], namespace);
    void this.schedule();
    return new Worker<T, D, R>(this, this.workerSharedResource, namespace, process, this.deps.get(namespace) || []).terminate;
  }
  public call(namespace: T, data: D, timeout = this.timeout): Promise<R[]> {
    void this.checkState();
    namespace = <T>concat([], namespace);
    return new Promise<R[]>((resolve, reject) => {
      void this.queue.push([
        namespace,
        data,
        results =>
          results.length === 0
            ? void reject(data)
            : void resolve(results),
        timeout,
        Date.now()
      ]);
      void this.schedule();
      if (timeout > 0 === false) return;
      void setTimeout(() => void this.drain(namespace), timeout + 9);
    });
  }
  public cast(namespace: T, data: D, retry = this.retry): R[] {
    void this.checkState();
    const results = this.procs.reflect(namespace, new WorkerCommand.Call(data));
    if (results.length === 0) {
      void this.events.fail.emit(namespace, [namespace, data]);
    }
    return results.length > 0 || !retry ? results : this.cast(namespace, data, false);
  }
  public refs(namespace: T): [T, (data: D) => R, (reason: any) => void][] {
    void this.checkState();
    return this.procs.refs(namespace)
      .map<[T, (data: D) => R, (reason: any) => void]>(([, recv]) => {
        const worker: Worker<T, D, R> = <any>recv(new WorkerCommand.Self());
        assert(worker instanceof Worker);
        return [
          worker.namespace,
          worker.process,
          worker.terminate
        ];
      });
  }
  public terminate(namespace?: T, reason?: any): void {
    void this.checkState();
    assert(this.registerable === true);
    if (namespace === void 0) {
      this.registerable = false;
    }
    void this.procs
      .emit(namespace || <T><any[]>[], new WorkerCommand.Exit(reason));
    void this.procs
      .off(namespace || <T><any[]>[]);
    if (namespace === void 0) {
      void this.destructor(reason);
    }
  }
  private checkState(): void {
    if (!this.alive) throw new Error(`Spica: Supervisor: Supervisor ${this.name} already exited.`);
  }
  private readonly queue: [T, D, (results: R[]) => void, number, number][] = [];
  private drain(target: T = <T><any[]>[]): void {
    const now = Date.now();
    for (let i = 0; i < this.queue.length; ++i) {
      const [namespace, data, callback, timeout, since] = this.queue[i];
      const results = target.every((n, i) => n === namespace[i])
        ? this.procs.reflect(namespace, new WorkerCommand.Call(data))
        : [];
      if (results.length === 0) {
        void this.events.fail.emit(namespace, [namespace, data]);
      }
      if (results.length === 0 && now < since + timeout) continue;
      i === 0 ? void this.queue.shift() : void this.queue.splice(i, 1);
      void --i;

      if (results.length === 0) {
        void this.events.loss.emit(namespace, [namespace, data]);
      }
      if (!callback) continue;
      try {
        void callback(results);
      }
      catch (err) {
        void console.error(err);
        assert(!console.info(err + ''));
      }
    }
  }
}

type WorkerCommand<T, D>
  = WorkerCommand.Self
  | WorkerCommand.Deps<T>
  | WorkerCommand.Call<D>
  | WorkerCommand.Exit;

namespace WorkerCommand {
  abstract class AbstractCommand {
    private readonly WORKER_COMMAND: void;
    constructor() {
      void this.WORKER_COMMAND;
    }
  }
  export class Self extends AbstractCommand {
    private readonly COMMAND: this;
    constructor() {
      super();
      void this.COMMAND;
    }
  }
  export class Deps<T> extends AbstractCommand {
    private readonly COMMAND: this;
    constructor(public readonly namespace: T) {
      super();
      void this.COMMAND;
    }
  }
  export class Call<D> extends AbstractCommand {
    private readonly COMMAND: this;
    constructor(public readonly data: D) {
      super();
      void this.COMMAND;
    }
  }
  export class Exit extends AbstractCommand {
    private readonly COMMAND: this;
    constructor(public readonly reason: any) {
      super();
      void this.COMMAND;
    }
  }
}

class Worker<T extends string[], D, R> {
  constructor(
    private readonly sv: Supervisor<T, D, R>,
    private readonly sharedResource: WorkerSharedResources<T, D, R>,
    public readonly namespace: T,
    public readonly process: (data: D) => R,
    private readonly dependencies: T[]
  ) {
    this.receive = (cmd: WorkerCommand<T, D>) => Worker.prototype.receive.call(this, cmd); // identifier
    this.terminate = (reason: any) => Worker.prototype.terminate.call(this, reason);

    this.sharedResource.allRefsCache = void 0;
    void ++(<typeof Supervisor>this.sv.constructor).procs;
    void this.sharedResource.procs
      .on(namespace, this.receive);
  }
  private destructor(reason: any): void {
    if (!this.alive) return;
    void this.sharedResource.procs
      .off(this.namespace, this.receive);
    this.alive = false;
    void --(<typeof Supervisor>this.sv.constructor).procs;
    this.sharedResource.allRefsCache = void 0;
    void Object.freeze(this);
    void this.sv.events.exit
      .emit(this.namespace, [this.namespace, this.process, reason]);
  }
  private alive = true;
  private called = false;
  private concurrency: number = 1;
  private tryDependencyResolving(): void {
    if (this.receive(new WorkerCommand.Deps(this.namespace))) {
      this.sharedResource.dependenciesStack = [];
      return;
    }
    else {
      this.sharedResource.dependenciesStack = [];
      throw void 0;
    }
  }
  public receive(cmd: WorkerCommand.Self): Worker<T, D, R>
  public receive(cmd: WorkerCommand.Deps<T>): boolean
  public receive(cmd: WorkerCommand<T, D>): R
  public receive(cmd: WorkerCommand<T, D>): any {
    void this.checkState();
    if (cmd instanceof WorkerCommand.Self) {
      return this;
    }
    if (cmd instanceof WorkerCommand.Deps) {
      if (cmd.namespace.length !== this.namespace.length) return false;
      if (this.concurrency === 0) return false;
      for (const stacked of this.sharedResource.dependenciesStack) {
        if (equal(this.namespace, stacked)) return true;
      }
      void this.sharedResource.dependenciesStack.push(this.namespace);
      return this.dependencies
        .every(dep =>
          (this.sharedResource.allRefsCache = this.sharedResource.allRefsCache || this.sharedResource.procs.refs(<T><any[]>[]))
            .some(([ns, proc]) => equal(ns, dep) && !!proc(new WorkerCommand.Deps(dep)))
        );
    }
    if (cmd instanceof WorkerCommand.Call) {
      if (this.concurrency === 0) throw void 0; // cancel
      void this.tryDependencyResolving();
      if (!this.called) {
        this.called = true;
        void this.sv.events.exec
          .emit(this.namespace, [this.namespace, this.process]);
      }
      try {
        void --this.concurrency;
        const result = this.process(cmd.data);
        if (isThenable(result)) {
          void (<PromiseLike<R>><any>result)
            .then(_ => {
              void this.sv.schedule();
              if (!this.alive) return;
              void ++this.concurrency;
            }, reason => {
              void this.sv.schedule();
              if (!this.alive) return;
              void ++this.concurrency;
              void this.terminate(reason);
            });
        }
        else {
          void ++this.concurrency;
        }
        return result;
      }
      catch (reason) {
        void this.terminate(reason);
        throw void 0;
      }
    }
    if (cmd instanceof WorkerCommand.Exit) {
      void this.terminate(cmd.reason);
      throw void 0;
    }
    throw new TypeError(`Spica: Supervisor: Invalid command: ${cmd}`);
  }
  public terminate(reason: any): void {
    void this.destructor(reason);
  }
  private checkState(): void {
    if (!this.alive) throw new Error(`Spica: Supervisor: Process ${this.namespace}/${this.process} already exited.`);
  }
}

function equal<T>(a: T[], b: T[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
