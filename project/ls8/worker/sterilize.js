module.exports = program => {
  return program
    .filter(line => line !== '' && line[0] !== '#')
    .map(line => line.slice(0, 8));
};
