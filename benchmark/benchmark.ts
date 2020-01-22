import * as Benchmark from 'benchmark';

export function benchmark(name: string, proc: () => unknown, done: (err?: unknown) => void) {
  new Benchmark.Suite()
    .add(`${name}`, function () {
      proc();
    })
    .on('cycle', function (event: Event) {
      console.log(String(event.target));
    })
    .on('complete', function () {
      done();
    })
    .run({ 'async': true });
}
