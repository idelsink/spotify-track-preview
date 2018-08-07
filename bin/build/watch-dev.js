#!/usr/bin/env node

const browserify = require('browserify');
const watchify = require('watchify');
const build = require('./index');

const b = browserify({
  ...build.defaultOpts,
  debug: true,
  plugin: [
    watchify
  ]
});
const bundle = () => b.bundle().pipe(build.createDefaultStream());

b.on('update', bundle);
bundle();
