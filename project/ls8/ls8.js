const fs = require('fs');

const RAM = require('./ram');
const CPU = require('./cpu');

/**
 * Load an LS8 program into memory
 *
 * TODO: load this from a file on disk instead of having it hardcoded
 */
function loadMemory(program) {
  // Hardcoded program to print the number 8 on the console

  //   const program = [
  // print8.ls8
  // "10011001", // LDI R0,8  Store 8 into R0
  // "00000000",
  // "00001000",
  // "01000011", // PRN R0    Print the value in R0
  // "00000000",
  // "00000001"  // HLT       Halt and quit
  //     '10011001', // LDI R0,8
  //     '00000000',
  //     '00001000',
  //     '10011001', // LDI R1,9
  //     '00000001',
  //     '00001001',
  //     '10101010', // MUL R0,R1 <---
  //     '00000000',
  //     '00000001',
  //     '01000011', // PRN R0
  //     '00000000',
  //     '00000001', // HLT
  //   ];

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

const sterilize = program => {
  return program
    .filter(line => line !== '' && line[0] !== '#')
    .map(line => line.slice(0, 8));
};

const programs = process.argv
  .slice(2, process.argv.length)
  .map(program => sterilize(fs.readFileSync(program, 'utf8').split('\n')));

// programs.forEach(program => loadMemory(program));

/* for now just load first program */
loadMemory(programs[0]);

loadMemory(cpu);

cpu.startClock();
