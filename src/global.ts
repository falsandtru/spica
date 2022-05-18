import './global.type.ts';

const global: { undefined: undefined } & typeof globalThis = void 0
  || typeof globalThis !== 'undefined' && globalThis
  // @ts-ignore
  || typeof self !== 'undefined' && self
  || Function('return this')();
global.global = global;
// Only provide the values, not the types.
export = global;
