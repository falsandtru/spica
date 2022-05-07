import { global } from './global';
import { singleton } from './function';

export const setTimeout = template(global.setTimeout, global.clearTimeout);
export const setInterval = template(global.setInterval, global.clearInterval);

function template(set: Function, unset: Function) {
  return <a>(wait: number, handler: () => a, unhandler?: (a: a) => void): () => void => {
    let params: [a];
    const timer = set(() => params = [handler()], wait);
    return singleton(() => {
      unset(timer);
      params && unhandler?.(params[0]);
    });
  };
}
