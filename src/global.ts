/// <reference path="./global.d.ts" />
export const global: typeof globalThis = void 0
  || typeof globalThis !== 'undefined' && globalThis
  || typeof self !== 'undefined' && self
  || Function('return this')();
export default global;
global.global = global;
