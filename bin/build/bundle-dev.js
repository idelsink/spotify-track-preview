#!/usr/bin/env node

const browserify = require('browserify');
const build = require('./index');

browserify({
  ...build.defaultOpts,
  debug: true
}).bundle().pipe(build.createDefaultStream());
