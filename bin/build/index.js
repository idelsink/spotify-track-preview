#!/usr/bin/env node

const browserify = require('browserify');
const watchify = require('watchify');
const fs = require('fs');

const ENTRIES = ['src/index.js'];
const OUTPUT = './bundle/bundle.js';

const defaultOpts = {
  entries: ENTRIES,
  transform: [
    [
      'browserify-css'
    ],
    [
      'babelify'
    ],
    [
      'vueify'
    ],
    [
      'git-describeify'
    ]
  ],
  extensions: ['.vue']
};

module.exports = {
  defaultOpts: defaultOpts,
  createDefaultStream: () => fs.createWriteStream(OUTPUT)
};
