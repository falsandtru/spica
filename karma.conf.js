module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['mocha'],
    files: [
      { pattern: 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js', watched: false, served: false, included: true },
      { pattern: 'node_modules/power-assert/build/power-assert.js', watched: true, served: true, included: true },
      { pattern: 'node_modules/benchmark/benchmark.js', watched: true, served: true, included: true },
      { pattern: 'dist/*.test.js', watched: true, served: true, included: true }
    ],
    exclude: [
    ],
    espowerPreprocessor: {
      options: {
        emitActualCode: false,
        ignoreUpstreamSourceMap: true
      }
    },
    reporters: ['dots'],
    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly', 'text-summary'],
      dir: 'coverage',
      combineBrowserReports: true,
      skipFilesWithNoCoverage: false,
      verbose: false,
      'report-config': {
        html: {
          subdir: 'html',
        },
      },
      instrumentation: {
        'default-excludes': false,
      },
    },
    coverageIstanbulInstrumenter: {
      esModules: true,
    },
    autoWatch: true,
    autoWatchBatchDelay: 500,
    browsers: ['Chrome'],
    singleRun: true,
  });
};
