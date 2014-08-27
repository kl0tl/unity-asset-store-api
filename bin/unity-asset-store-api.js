#! /usr/bin/env node

'use strict';

var fs = require('fs');

var clc = require('cli-color');
var optimist = require('optimist');

var api = require('../index');
var pkg = require('../package.json');

var doc = [
  pkg.description,,

  'Usage:',,

  '  ' + clc.cyan('unity-asset-store-api') + ' <url> [options]',,

  'Options:',,

  '  ' + clc.magenta('-h --help') + '                   Show this.',
  '  ' + clc.magenta('-o <file>, --output <file>') + '  Write output to file.',
  '  ' + clc.magenta('-v --version') + '                Show version number.',,
].join('\n');

if (process.argv.length < 3) {
  writeDocToStdout();
} else {
  var argv = optimist.argv;

  if (argv.h || argv.help) {
    writeDocToStdout();
  } else if (argv.v || argv.version) {
    writeVersionToStdout();
  } else {
    api.get(argv._[0])
      .then(JSON.stringify)
      .then(function (res) {
        var output = argv.o || argv.output;

        if (output) {
          return write(output, res);
        }

        process.stdout.write(res + '\n');
      })
      .catch(throwError);
  }
}

function throwError(err) {
  process.nextTick(function () {
    throw err;
  });
}

function write(filename, contents) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(filename, contents, function (err) {
      if (err) reject(err);
      else resolve();
    });
  });
}

function writeDocToStdout() {
  process.stdout.write('\n' + doc + '\n');
}

function writeVersionToStdout() {
  process.stdout.write(pkg.version + '\n');
}
