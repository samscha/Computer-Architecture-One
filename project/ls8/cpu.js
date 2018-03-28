/**
 * LS-8 v2.0 emulator skeleton code
 */

/**
 * Class for simulating a simple Computer (CPU & memory)
 */
class CPU {
  /**
   * Initialize the CPU
   */
  constructor(ram) {
    this.ram = ram;

    this.reg = new Array(8).fill(0); // General-purpose registers R0-R7

    // Special-purpose registers
    this.reg.PC = 0; // Program Counter

    this.reg[7] = 256 - 12;
    /* register R7 (reserved) = F4 address in ram */

    this.bt = [];

    const LDI = 0b10011001;
    const PRN = 0b01000011;

    const MUL = 0b10101010;

    const HLT = 0b00000001;

    const PUSH = 0b01001101;
    const POP = 0b01001100;

    const CALL = 0b01001000;
    const RET = 0b00001001;

    const ADD = 0b10101000;

    this.bt[LDI] = (opA, opB) => {
      this.reg[opA] = opB;
    };

    this.bt[PRN] = (opA, opB) => {
      console.log(this.reg[opA]);
    };

    this.bt[MUL] = (opA, opB) => {
      this.alu('MUL', opA, opB);
    };

    this.bt[HLT] = (opA, opB) => {
      this.stopClock();
    };

    this.bt[PUSH] = (opA, opB) => {
      this.ram.write(--this.reg[7], this.reg[opA]);
    };

    this.bt[POP] = (opA, opB) => {
      // check if this.reg[7] === 256 - 12
      // else
      this.reg[opA] = this.ram.read(this.reg[7]++);
    };

    this.bt[CALL] = (opA, opB) => {
      this.reg.PC += CALL >>> 6;
      this.bt[PUSH]('PC');

      this.reg.PC = this.reg[opA];

      return true;
    };

    this.bt[RET] = (opA, opB) => {
      this.bt[POP]('PC');
    };

    this.bt[ADD] = (opA, opB) => {
      this.reg[opA] = this.reg[opA] + this.reg[opB];
    };
  }

  /**
   * Store value in memory address, useful for program loading
   */
  poke(address, value) {
    this.ram.write(address, value);
  }

  /**
   * Starts the clock ticking on the CPU
   */
  startClock() {
    const _this = this;

    this.clock = setInterval(() => {
      _this.tick();
    }, 1); // 1 ms delay == 1 KHz clock == 0.000001 GHz
  }

  /**
   * Stops the clock
   */
  stopClock() {
    clearInterval(this.clock);

    this.onHalt();
  }

  /**
   * ALU functionality
   *
   * The ALU is responsible for math and comparisons.
   *
   * If you have an instruction that does math, i.e. MUL, the CPU would hand
   * it off to it's internal ALU component to do the actual work.
   *
   * op can be: ADD SUB MUL DIV INC DEC CMP
   */
  alu(op, regA, regB) {
    switch (op) {
      case 'MUL':
        this.reg[regA] *= this.reg[regB];
        break;
    }
  }

  /**
   * Advances the CPU one cycle
   */
  tick() {
    // Load the instruction register (IR--can just be a local variable here)
    // from the memory address pointed to by the PC. (I.e. the PC holds the
    // index into memory of the next instruction.)

    const IR = this.ram.read(this.reg.PC);

    // Debugging output
    // console.log(`${this.reg.PC}: ${IR.toString(2)}`);

    // Get the two bytes in memory _after_ the PC in case the instruction
    // needs them.

    const operandA = this.ram.read(this.reg.PC + 1);
    const operandB = this.ram.read(this.reg.PC + 2);

    // Execute the instruction. Perform the actions for the instruction as
    // outlined in the LS-8 spec.

    const IRCall = this.bt[IR](operandA, operandB);

    // Increment the PC register to go to the next instruction. Instructions
    // can be 1, 2, or 3 bytes long. Hint: the high 2 bits of the
    // instruction byte tells you how many bytes follow the instruction byte
    // for any particular instruction.

    if (IRCall) return;

    this.reg.PC += 1 + (IR >>> 6);
  }
}

module.exports = CPU;
