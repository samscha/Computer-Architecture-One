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

  if (clock > programs.length - 1) return;

  console.log(`PROGRAM ${programNames[clock]}:`);

  ram = new RAM(256);
  cpu = new CPU(ram);

  cpu.onHalt = onHalt;

  loadMemory(programs[clock]);
  clock++;

  cpu.startClock();
};

/**
 * Main
 */

const programs = readPrograms(process.argv);
const programNames = process.argv.slice(2);

let ram = new RAM(256);
let cpu = new CPU(ram);
let clock = 0;

onHalt();
