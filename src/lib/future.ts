export class Future<T = undefined> extends Promise<T> {
  static get [Symbol.species]() {
    return Promise;
  }
  constructor() {
    let bind: (value: T | PromiseLike<T>) => Promise<T>;
    super(resolve =>
      bind = value => {
        void resolve(value);
        return Promise.all([this, value])
          .then(([a, b]) =>
            [a].includes(b)
              ? this
              : Promise.reject(new Error(`Spica: Future: Cannot rebind a different value.`)));
      });
    this.bind = bind!;
  }
  public readonly bind!: (value: T | PromiseLike<T>) => Promise<T>;
}
