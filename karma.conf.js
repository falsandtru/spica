module.exports = function (config) {
  config.set({
    basePath: '',
    client: {
      useIframe: false
    },
    frameworks: ['mocha'],
    files: [
      { pattern: 'https://cdn.polyfill.io/v2/polyfill.min.js', watched: false, served: false, included: true },
      { pattern: 'node_modules/power-assert/build/power-assert.js', watched: true, served: true, included: true },
      { pattern: 'node_modules/lodash/lodash.js', watched: true, served: true, included: true },
      { pattern: 'node_modules/benchmark/benchmark.js', watched: true, served: true, included: true },
      { pattern: 'dist/*.js', watched: true, served: true, included: true }
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
    coverageReporter: {
      dir: 'coverage',
      subdir: function (browser, platform) {
        return browser.toLowerCase().split(' ')[0];
      },
      reporters: [
        { type: 'lcov' },
        { type: 'text-summary', subdir: '.', file: 'summary.txt' }
      ]
    },
    autoWatch: true,
    browsers: ['Chrome']
  });
};
