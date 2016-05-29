import {v4 as uuid} from '../uuid';
import {sqid} from '../sqid';

const UNIQUE_ATTRIBUTE = `${uuid()}`;
function store(obj: Object) {
  return obj[UNIQUE_ATTRIBUTE]
    ? obj[UNIQUE_ATTRIBUTE]
    : Object.defineProperty(obj, UNIQUE_ATTRIBUTE, {
      value: Object.create(null),
      enumerable: false,
      writable: false,
      configurable: true
    })[UNIQUE_ATTRIBUTE];
}

export class WeakMap<K extends Object, V> {
  private id = +sqid();
  public get(key: K): V {
    return (store(key)[this.id] || [])[0];
  }
  public set(key: K, val: V): V {
    return (store(key)[this.id] = [val])[0];
  }
  public has(key: K): boolean {
    return !!store(key)[this.id];
  }
  public delete(key: K): void {
    void delete store(key)[this.id];
  }
}
