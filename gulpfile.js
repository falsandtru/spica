const gulp = require('gulp');
const glob = require('glob');
const shell = cmd => require('child_process').execSync(cmd, { stdio: [0, 1, 2] });
const del = require('del');
const extend = require('extend');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const $ = require('gulp-load-plugins')();
const seq = require('run-sequence');
const browserify = require('browserify');
const watchify = require('watchify');
const tsify = require('tsify');
const pump = require('pump');
const Server = require('karma').Server;

const pkg = require('./package.json');
const config = {
  browsers: ['Chrome', 'Firefox'].concat((os => {
    switch (os) {
      case 'Windows_NT':
        return ['Edge'];
      case 'Darwin':
        return ['Safari'];
     default:
        return [];
    }
  })(require('os').type())),
  ts: {
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
  clean: {
    dist: 'dist'
  }
};

function compile({src, dest}, cb, watch) {
  let done = true;
  const b = browserify(Object.values(src).map(p => glob.sync(p)), {
    cache: {},
    packageCache: {},
    plugin: watch ? [watchify] : [],
  })
    .require(`./index.ts`, { expose: pkg.name })
    .plugin(tsify, Object.assign({ global: true }, require('./tsconfig.json').compilerOptions))
    .on('update', () => cb(bundle()));
  return cb(bundle());

  function bundle() {
    console.time('bundle');
    return b
      .bundle()
      .on("error", err => done = console.log(err + ''))
      .pipe(source(`${pkg.name}.js`))
      .pipe(buffer())
      .once('finish', () => console.timeEnd('bundle'))
      .once("finish", () => done || force || process.exit(1))
      .pipe(gulp.dest(dest));
  }
}

gulp.task('ts:watch', function () {
  return compile(config.ts.test, b => b, true);
});

gulp.task('ts:test', function () {
  return compile(config.ts.test, b => b);
});

gulp.task('ts:bench', function () {
  return compile(config.ts.bench, b =>
    pump([
      b,
      $.unassert(),
      gulp.dest(config.ts.bench.dest)
    ]));
});

gulp.task('ts:dist', function () {
  return compile(config.ts.dist, b =>
    pump([
      b,
      $.unassert(),
      $.header(config.banner),
      gulp.dest(config.ts.dist.dest),
      $.rename({ extname: '.min.js' }),
      $.uglify({ output: { comments: 'all' } }),
      gulp.dest(config.ts.dist.dest)
    ]));
});

gulp.task('karma:watch', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    browsers: config.browsers,
    preprocessors: {
      'dist/*.js': ['espower']
    },
  }, done).start();
});

gulp.task('karma:test', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    browsers: config.browsers,
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
    browsers: config.browsers,
    singleRun: true
  }, done).start();
});

gulp.task('karma:ci', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    browsers: config.browsers,
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
  shell('npm i --no-shrinkwrap');
});

gulp.task('update', function () {
  shell('ncu -ua');
  shell('npm i -DE typescript@next --no-shrinkwrap');
  shell('npm i --no-shrinkwrap');
});

gulp.task('watch', ['clean'], function () {
  return seq(
    [
      'ts:watch',
      'karma:watch'
    ],
  );
});

gulp.task('test', ['clean'], function () {
  return seq(
    'ts:test',
    'karma:test',
    'ts:dist',
  );
});

gulp.task('bench', ['clean'], function () {
  return seq(
    'ts:bench',
    'karma:bench',
  );
});

gulp.task('dist', ['clean'], function () {
  return seq(
    'ts:dist',
  );
});

gulp.task('ci', ['clean'], function () {
  return seq(
    'ts:test',
    'karma:ci',
    'dist',
  );
});
