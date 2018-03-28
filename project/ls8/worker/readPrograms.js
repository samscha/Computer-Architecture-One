const fs = require('fs');
const sanitize = require('./sanitize');

module.exports = arr =>
  arr
    .slice(2, process.argv.length)
    .map(program => sanitize(fs.readFileSync(program, 'utf8').split('\n')));
