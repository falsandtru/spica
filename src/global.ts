import './global.type';

const global: { undefined: undefined } & typeof globalThis = undefined
  || typeof globalThis !== 'undefined' && globalThis
  // @ts-ignore
  || typeof self !== 'undefined' && self
  || Function('return this')();
global.global = global;
// Only provide the values, not the types.
export = global;
