import './global.type.ts';

const global: { undefined: undefined } & typeof globalThis = void 0
  || typeof globalThis !== 'undefined' && globalThis
  // @ts-ignore
  || typeof self !== 'undefined' && self
  || Function('return this')();
// `global.global = global` breaks the build on the dependent projects.
eval('global.global = global');
// Don't provide types.
export = global;
