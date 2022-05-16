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
    plugins: 'replace',
  });
  const config = {
    mode: 'production',
    resolve: {
      extensions: ['.ts'],
    },
    entry: Object.fromEntries(glob.sync('./src/*.ts', {
      ignore: './**/*{.d,.test}.ts',
    }).map(path => [path.match(/[\w.]+(?=\.)/)[0], path])),
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
      library: pkg.name,
      libraryTarget: 'umd',
      globalObject: 'globalThis',
    },
    optimization: {
      minimize: false,
    },
    performance: {
      maxEntrypointSize: Infinity,
      maxAssetSize: Infinity,
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                plugins: ['babel-plugin-unassert'],
              },
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
      new ESLintPlugin({
        extensions: ['ts'],
      }),
    ],
  };
  switch (env.mode) {
    case 'dev':
      return merge(config, {
        entry: glob.sync('./{src,test}/**/*.ts', {
          ignore: './**/*.d.ts',
        }),
        module: {
          rules: [
            {
              test: /\.ts$/,
              exclude: /node_modules/,
              use: [
                {
                  loader: 'babel-loader',
                  options: {},
                },
              ],
            },
          ],
        },
        plugins: [
          new ESLintPlugin({
            extensions: ['ts'],
            overrideConfig: {
              rules: {
                'redos/no-vulnerable': 'off',
              },
            },
          }),
        ],
      });
    case 'test':
      return merge(config, {
        entry: glob.sync('./{src,test}/**/*.ts', {
          ignore: './**/*.d.ts',
        }),
        module: {
          rules: [
            {
              test: /\.ts$/,
              exclude: /node_modules/,
              use: [
                {
                  loader: 'babel-loader',
                  options: {},
                },
              ],
            },
          ],
        },
      });
    case 'bench':
      return merge(config, {
        entry: glob.sync('./benchmark/**/*.ts', {
          ignore: './**/*.d.ts',
        }),
      });
    case 'dist':
      return merge(config, {
        output: {
          filename: '[name].js',
          path: path.resolve(__dirname),
        },
        module: {
          rules: [
            {
              test: /\.ts$/,
              exclude: /node_modules/,
              use: [
                {
                  loader: 'ts-loader',
                  options: {
                    compilerOptions: {
                      "rootDir": "src",
                      "outDir": "",
                    },
                    onlyCompileBundledFiles: true,
                  },
                },
              ],
            },
          ],
        },
      });
  }
};
