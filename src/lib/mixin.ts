import { assign } from './assign';

export function Mixin<T extends object>(...mixins: Array<new () => object>): new () => T {
  return <new () => T>mixins.reduceRight((b, d) => __extends(d, b), class { });
}

function __extends(d: new () => object, b: new () => object): new () => object {
  const __ = class {
    constructor() {
      return d.call(b.call(this) || this);
    }
  };
  void assign(__.prototype, d.prototype, b.prototype);
  for (const p in b) if (b.hasOwnProperty(p)) __[p] = b[p];
  for (const p in d) if (d.hasOwnProperty(p)) __[p] = d[p];
  return __;
}
