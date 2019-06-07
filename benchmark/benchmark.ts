import * as IBenchmark from 'benchmark';
declare const Benchmark: typeof IBenchmark;

interface Event {
  target: void;
}

export function benchmark(name: string, proc: () => unknown, done: (err?: unknown) => void) {
  new Benchmark.Suite()
    .add(`${name}`, function () {
      proc();
    })
    .on('cycle', function (event: Event) {
      console.debug(String(event.target));
    })
    .on('complete', function () {
      done();
    })
    .run({ 'async': true });
}
