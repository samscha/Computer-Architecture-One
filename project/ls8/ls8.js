const readPrograms = require('./worker/readPrograms');

const RAM = require('./ram');
const CPU = require('./cpu');

/**
 * Load an LS8 program into memory
 */
function loadMemory(program) {
  // Load the program into the CPU's memory a byte at a time
  for (let i = 0; i < program.length; i++) {
    cpu.poke(i, parseInt(program[i], 2));
  }
}

const onHalt = _ => {
  console.log('');

  if (cycle > programs.length - 1) return;

  console.log(`<< ${programNames[cycle]} >>`);

  ram = new RAM(256); /* new cpu */
  cpu = new CPU(ram); /* new ram */

  cpu.onHalt = onHalt; /* register with cpu */

  loadMemory(programs[cycle++]); /* load new program into cpu */

  cpu.startClock(); /* start cpu */
};

/**
 * Main
 */

const programs = readPrograms(process.argv);
const programNames = process.argv.slice(2);

let ram = new RAM(256);
let cpu = new CPU(ram);
let cycle = 0;

onHalt();
