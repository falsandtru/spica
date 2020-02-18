/// <reference path="./global.d.ts" />
const global: typeof globalThis = void 0
  || typeof globalThis !== 'undefined' && globalThis
  || typeof self !== 'undefined' && self
  || Function('return this')();
global.global = global;
// Don't provide types.
export = global;
