import Benchmark from 'benchmark';

declare namespace NS {
  export {
    Benchmark,
  }
}

declare global {
  const Benchmark: typeof NS.Benchmark;
  namespace Benchmark {
    export type Options = NS.Benchmark.Options;
  }
}
