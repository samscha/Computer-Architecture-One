const fs = require('fs');

module.exports = (file, cb) => {
  if (!fs.existsSync(`./${file}`)) {
    console.error(`File with path '/ls8/${file}' does not exist`);
    process.exit(1);
  }

  return cb();
};
