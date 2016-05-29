import * as IBenchmark from 'benchmark';
declare const Benchmark: typeof IBenchmark;

export function benchmark(name: string, proc: () => any, done: (err?: any) => void) {
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
