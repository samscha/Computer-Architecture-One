const fs = require('fs');
const sanitize = require('./sanitize');

module.exports = file => {
  if (!fs.existsSync(`./${file}`)) {
    console.error(`File with path '/ls8/${file}' does not exist`);
    return;
  }

  return sanitize(fs.readFileSync(file, 'utf8').split('\n'));
};
