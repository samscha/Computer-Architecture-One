const readProgram = require('./worker/readProgram');
// const checkArgs = require('./worker/checkArgs');

const RAM = require('./ram');
const CPU = require('./cpu');

/**
 * Load an LS8 program into memory
 */
function loadMemory(cpu, program) {
  // Load the program into the CPU's memory a byte at a time
  for (let i = 0; i < program.length; i++) {
    cpu.poke(i, parseInt(program[i], 2));
  }
}

const onHalt = _ => {
  console.log('');
  if (cycle > process.argv.length - 2 - 1) return;

  console.log(`<< ${process.argv.slice(2)[cycle]} >>`);

  const ram = new RAM(256); /* new cpu */
  const cpu = new CPU(ram); /* new ram */

  cpu.onHalt = onHalt; /* register onHalt with cpu */

  const program = readProgram(process.argv.slice(2)[cycle++]);

  if (!program) {
    onHalt();
    return;
  }

  loadMemory(cpu, program); /* load new program into cpu */
  cpu.startClock(); /* start cpu */
};

/**
 * Main
 */

let cycle = 0;

onHalt();
