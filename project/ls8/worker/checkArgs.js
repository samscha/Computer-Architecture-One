const fs = require('fs');

module.exports = parms => {
  parms.slice(2).forEach(parm => {
    if (!fs.existsSync(`./${parm}`)) {
      console.error(`File with path '/ls8/${parm}' does not exist`);
      process.exit(1);
    }
  });
};
