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

/**
 * Main
 */

let ram = new RAM(256);
let cpu = new CPU(ram);

const programs = readPrograms(process.argv);

// programs.forEach(program => loadMemory(program));

/* for now just load first program */
loadMemory(programs[0]);

cpu.startClock();
