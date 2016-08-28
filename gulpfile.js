const gulp = require('gulp');
const shell = cmd => require('child_process').execSync(cmd, { stdio: [0, 1, 2] });
const del = require('del');
const extend = require('extend');
const seq = require('run-sequence');
const $ = require('gulp-load-plugins')();
const Server = require('karma').Server;

const pkg = require('./package.json');
const config = {
  ts: {
    options: extend(require('./tsconfig.json').compilerOptions, {
      typescript: require('typescript'),
      outFile: `${pkg.name}.js`
    }),
    dist: {
      src: [
        '*.ts'
      ],
      dest: 'dist'
    },
    test: {
      src: [
        '*.ts',
        'src/**/*.ts',
        'test/**/*.ts'
      ],
      dest: 'dist'
    },
    bench: {
      src: [
        'typings/*.d.ts',
        'typings/benchmark/*.d.ts',
        '*.ts',
        'benchmark/**/*.ts'
      ],
      dest: 'dist'
    }
  },
  banner: [
    `/*! ${pkg.name} v${pkg.version} ${pkg.repository.url} | (c) 2016, ${pkg.author} | ${pkg.license} License */`,
    ''
  ].join('\n'),
  exporter:
`define = typeof define === 'function' && define.amd
  ? define
  : (function () {
    'use strict';
    var name = '${pkg.name}',
        workspace = {};
    return function define(m, rs, f) {
      return !f
        ? void define(name, m, rs)
        : void f.apply(this, rs.map(function (r) {
          switch (r) {
            case 'require': {
              return typeof require === 'function' ? require : void 0;
            }
            case 'exports': {
              return m.indexOf('/') === -1
                ? workspace[m] = typeof exports === 'undefined' ? self[m] = self[m] || {} : exports
                : workspace[m] = workspace.hasOwnProperty(m) ? workspace[m] : {};
            }
            default: {
              return r.slice(-2) === '.d' && {}
                  || workspace.hasOwnProperty(r) && workspace[r]
                  || typeof require === 'function' && require(r)
                  || self[r];
            }
          }
        }));
    };
  })();
`,
  clean: {
    dist: 'dist'
  }
};

gulp.task('ts:watch', function () {
  gulp.watch(config.ts.test.src, ['ts:test']);
});

gulp.task('ts:test', function () {
  return gulp.src(config.ts.test.src)
    .pipe($.typescript(config.ts.options))
    .pipe($.header(config.exporter))
    .pipe(gulp.dest(config.ts.test.dest));
});

gulp.task('ts:bench', function () {
  return gulp.src(config.ts.bench.src)
    .pipe($.typescript(config.ts.options))
    .pipe($.header(config.exporter))
    .pipe(gulp.dest(config.ts.bench.dest));
});

gulp.task('ts:dist', function () {
  return gulp.src(config.ts.dist.src)
    .pipe($.typescript(config.ts.options))
    .once("error", function () {
      this.once("finish", () => process.exit(1));
    })
    .pipe($.unassert())
    .pipe($.header(config.exporter))
    .pipe($.header(config.banner))
    .pipe(gulp.dest(config.ts.dist.dest))
    .pipe($.uglify({ preserveComments: 'license' }))
    .pipe($.rename({ extname: '.min.js' }))
    .pipe(gulp.dest(config.ts.dist.dest));
});

gulp.task('karma:watch', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    browsers: ['Chrome', 'Firefox'],
    preprocessors: {
      'dist/*.js': ['espower']
    },
  }, done).start();
});

gulp.task('karma:test', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    browsers: ['Chrome', 'Firefox'],
    reporters: ['dots', 'coverage'],
    preprocessors: {
      'dist/*.js': ['coverage', 'espower']
    },
    singleRun: true
  }, done).start();
});

gulp.task('karma:bench', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    browsers: ['Chrome', 'Firefox'],
    singleRun: true
  }, done).start();
});

gulp.task('karma:server', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    browsers: ['Chrome', 'Firefox'],
    reporters: ['dots', 'coverage', 'coveralls'],
    preprocessors: {
      'dist/*.js': ['coverage', 'espower']
    },
    singleRun: true
  }, done).start();
});

gulp.task('clean', function () {
  return del([config.clean.dist]);
});

gulp.task('install', function () {
  shell('npm i');
});

gulp.task('update', function () {
  shell('npm-check-updates -u');
  shell('npm i');
});

gulp.task('watch', ['clean'], function () {
  seq(
    'ts:test',
    [
      'ts:watch',
      'karma:watch'
    ]
  );
});

gulp.task('test', ['clean'], function (done) {
  seq(
    'ts:test',
    'karma:test',
    function () {
      done();
    }
  );
});

gulp.task('bench', ['clean'], function (done) {
  seq(
    'ts:bench',
    'karma:bench',
    function () {
      done();
    }
  );
});

gulp.task('dist', ['clean'], function (done) {
  seq(
    'ts:dist',
    done
  );
});

gulp.task('server', ['clean'], function (done) {
  seq(
    'ts:test',
    'karma:server',
    'bench',
    'dist',
    function () {
      done();
    }
  );
});
