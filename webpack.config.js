const path = require('path');
const glob = require('glob');
const shell = cmd => require('child_process').execSync(cmd, { stdio: [0, 1, 2] });
const webpack = require('webpack');
const { mergeWithRules } = require('webpack-merge');
const ESLintPlugin = require('eslint-webpack-plugin');
const pkg = require('./package.json');

shell('rm -rf dist coverage');

module.exports = env => {
  const merge = mergeWithRules({
    entry: 'replace',
    module: {
      rules: {
        test: 'match',
        use: {
          loader: 'match',
          options: 'replace',
          plugins: 'replace',
        },
      },
    },
    plugins: 'append',
  });
  const config = {
    mode: 'production',
    externals: {
      benchmark: 'Benchmark',
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    entry: glob.sync('./{src,test}/**/*.ts', { absolute: true }).sort(),
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist'),
      //library: pkg.name,
      libraryTarget: 'umd',
      globalObject: 'this',
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
            },
            {
              loader: 'ts-loader',
              options: {
                onlyCompileBundledFiles: true,
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new webpack.BannerPlugin({
        banner: `${pkg.name} v${pkg.version} ${pkg.repository.url} | (c) 2015, ${pkg.author} | ${pkg.license} License`,
      }),
    ],
    performance: {
      maxEntrypointSize: Infinity,
      maxAssetSize: Infinity,
    },
    optimization: {
      minimize: false,
    },
  };
  switch (env.mode) {
    case 'test':
      return merge(config);
    case 'lint':
      return merge(config, {
        entry: glob.sync('./!(node_modules)/**/*.ts', { absolute: true }).sort(),
        plugins: [
          new ESLintPlugin({
            extensions: ['ts'],
          }),
        ],
      });
    case 'bench':
      return merge(config, {
        entry: glob.sync('./benchmark/**/*.ts', { absolute: true }).sort(),
        module: {
          rules: [
            {
              test: /\.ts$/,
              use: [
                {
                  loader: 'babel-loader',
                  options: {
                    plugins: ['babel-plugin-unassert'],
                  },
                },
              ],
            },
          ],
        },
      });
    // Awaiting https://github.com/webpack/webpack/issues/5866
    // to avoid duplicate bundling of modules.
    //case 'dist':
    //  return merge(config, {
    //    entry: Object.fromEntries(glob.sync('./src/*.ts', {
    //      absolute: true,
    //      ignore: './**/*.test.ts',
    //    }).map(path => [path.match(/[\w.]+(?=\.)/)[0], path]).sort()),
    //    output: {
    //      filename: '[name].js',
    //      path: path.resolve(__dirname),
    //    },
    //    module: {
    //      rules: [
    //        {
    //          test: /\.ts$/,
    //          use: [
    //            {
    //              loader: 'babel-loader',
    //              options: {
    //                plugins: ['babel-plugin-unassert'],
    //              },
    //            },
    //            {
    //              loader: 'ts-loader',
    //              options: {
    //                compilerOptions: {
    //                  "declaration": true,
    //                  "rootDir": "src",
    //                  "outDir": "",
    //                },
    //                onlyCompileBundledFiles: true,
    //              },
    //            },
    //          ],
    //        },
    //      ],
    //    },
    //  });
  }
};
