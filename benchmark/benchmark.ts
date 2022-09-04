import Benchmark from 'benchmark';
import { wait } from '../src/timer';

mocha.setup({
  timeout: 600 * 1e3,
  rootHooks: {
    beforeEach: () => wait(1e3),
  },
});

export function benchmark(name: string, proc: (done: () => void) => unknown, done: (err?: unknown) => void, options: Benchmark.Options = {}) {
  new Benchmark.Suite()
    .add({
      minSamples: 60,
      ...options,
      name,
      fn: (d: any) => proc(() => d.resolve()),
    })
    .on('cycle', function (event: Event) {
      console.log(String(event.target));
    })
    .on('complete', () => done())
    .run({ 'async': true });
}
