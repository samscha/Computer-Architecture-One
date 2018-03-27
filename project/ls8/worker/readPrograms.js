const fs = require('fs');
const sterilize = require('./sterilize');

module.exports = arr =>
  arr
    .slice(2, process.argv.length)
    .map(program => sterilize(fs.readFileSync(program, 'utf8').split('\n')));
