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
const minify = require('gulp-uglify/composer')(require('uglify-es'), console);
const Server = require('karma').Server;

const pkg = require('./package.json');
const config = {
  browsers: ['Chrome', 'Firefox'].concat((os => {
    switch (os) {
      case 'Windows_NT':
        return ['Edge'];
      case 'Darwin':
        return [];
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
    `/*! ${pkg.name} v${pkg.version} ${pkg.repository.url} | (c) 2017, ${pkg.author} | ${pkg.license} License */`,
    ''
  ].join('\n'),
  clean: {
    dist: 'dist'
  }
};

function compile({ src, dest }, opts = {}) {
  let done = true;
  const force = !!opts.plugin && opts.plugin.includes(watchify);
  const b = browserify(Object.values(src).map(p => glob.sync(p)), {
    cache: {},
    packageCache: {},
    ...opts,
  })
    .require(`./index.ts`, { expose: pkg.name })
    .plugin(tsify, { global: true, ...require('./tsconfig.json').compilerOptions })
    .on('update', () => void bundle());
  return bundle();

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
  return compile(config.ts.test, {
    plugin: [watchify],
  });
});

gulp.task('ts:test', function () {
  return compile(config.ts.test);
});

gulp.task('ts:bench', function () {
  return compile(config.ts.bench)
    .pipe($.unassert())
    .pipe(gulp.dest(config.ts.bench.dest));
});

gulp.task('ts:dist', function () {
  return compile(config.ts.dist)
    .pipe($.unassert())
    .pipe($.header(config.banner))
    .pipe(gulp.dest(config.ts.dist.dest))
    .pipe($.rename({ extname: '.min.js' }))
    .pipe(minify({ output: { comments: /^!/ } }))
    .pipe(gulp.dest(config.ts.dist.dest));
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
    preprocessors: {
      'dist/*.js': ['coverage', 'espower']
    },
    reporters: ['dots', 'coverage'],
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
    preprocessors: {
      'dist/*.js': ['coverage', 'espower']
    },
    reporters: ['dots', 'coverage', 'coveralls'],
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

gulp.task('watch', ['clean'], function (done) {
  seq(
    [
      'ts:watch',
      'karma:watch'
    ],
    done
  );
});

gulp.task('test', ['clean'], function (done) {
  seq(
    'ts:test',
    'karma:test',
    'ts:dist',
    done
  );
});

gulp.task('bench', ['clean'], function (done) {
  seq(
    'ts:bench',
    'karma:bench',
    done
  );
});

gulp.task('dist', ['clean'], function (done) {
  seq(
    'ts:dist',
    done
  );
});

gulp.task('ci', ['clean'], function (done) {
  seq(
    'ts:test',
    'karma:ci',
    'dist',
    done
  );
});
