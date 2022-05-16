import Benchmark from 'benchmark';

export function benchmark(name: string, proc: (done: () => void) => unknown, done: (err?: unknown) => void, options: Benchmark.Options = {}) {
  new Benchmark.Suite()
    .add({
      ...options,
      name,
      fn: (d: any) => proc(() => d.resolve()),
    })
    .on('cycle', function (event: Event) {
      console.log(String(event.target));
    })
    .on('complete', function () {
      done();
    })
    .run({ 'async': true });
}
