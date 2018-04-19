import assert from 'power-assert';

type Assert = typeof assert;

declare global {
  const assert: Assert;

  namespace navigator {
    export const userAgent: string;
  }
}
