const fs = require('fs');
const checkArg = require('./checkArg');
const sanitize = require('./sanitize');

module.exports = file => {
  return checkArg(file, _ => {
    return sanitize(fs.readFileSync(file, 'utf8').split('\n'));
  });
};
