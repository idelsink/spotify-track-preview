#!/usr/bin/env node

const browserify = require('browserify');
const build = require('./index');
const commonShake = require('common-shakeify');
const packFlat = require('browser-pack-flat/plugin');
const minifyStream = require('minify-stream');

browserify({
  ...build.defaultOpts,
  debug: false
}).transform('uglifyify', { global: true })
  .plugin(commonShake, { /* options */ })
  .plugin(packFlat, { /* options */ })
  .bundle()
  .pipe(minifyStream({ sourceMap: false }))
  .pipe(build.createDefaultStream());
