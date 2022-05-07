import { global } from './global';
import { singleton } from './function';

export const setImmediate = template(global.setImmediate, global.clearImmediate);
export const setTimeout = template(global.setTimeout, global.clearTimeout);
export const setInterval = template(global.setInterval, global.clearInterval);

function template(registrator: Function, unregistrator: Function) {
  return <T extends readonly unknown[]>(handler: (...args: T) => void, timeout?: number, ...args: T): () => void => {
    const timer = registrator(handler, timeout, ...args);
    return singleton(() => void unregistrator(timer));
  };
}
