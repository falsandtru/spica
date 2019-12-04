/// <reference path="./global.d.ts" />
export const global = typeof globalThis !== 'undefined' && globalThis || typeof self !== 'undefined' && self || this;
export default global;
global.global = global;
