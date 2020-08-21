/// <reference path="./global.d.ts" />
const global: typeof globalThis & { undefined: undefined } = void 0
  || typeof globalThis !== 'undefined' && globalThis
  || typeof self !== 'undefined' && self
  || Function('return this')();
global.global = global;
// Don't provide types.
export = global;
