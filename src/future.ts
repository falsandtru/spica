export class Future<T = undefined> extends Promise<T> {
  static get [Symbol.species]() {
    return Promise;
  }
  constructor() {
    let state = true;
    let bind: (value: T | PromiseLike<T>) => Promise<T>;
    super(resolve =>
      bind = value => {
        if (!state) throw new Error(`Spica: Future: Cannot rebind a value.`);
        state = false;
        void resolve(value);
        return this;
      });
    this.bind = bind!;
  }
  public readonly bind!: (value: T | PromiseLike<T>) => Promise<T>;
}
