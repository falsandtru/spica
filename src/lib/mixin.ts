import {assign} from './assign';

export function Mixin<T>(...mixins: Array<new (...args: any[]) => any>): new (...args: any[]) => T {
  return mixins.reduceRight((b, d) => __extends(d, b), class { });
}

function __extends(d: new () => any, b: new () => any): new () => any {
  const __ = class {
    constructor() {
      return d.apply(b.apply(this, arguments) || this, arguments);
    }
  };
  void assign(__.prototype, d.prototype, b.prototype);
  for (const p in b) if (b.hasOwnProperty(p)) __[p] = b[p];
  for (const p in d) if (d.hasOwnProperty(p)) __[p] = d[p];
  return __;
}
