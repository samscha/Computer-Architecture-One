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

    /* set alias for IM register (reserved register R5) */
    this.reg.IM = this.reg[5];

    /* add alias for IS register (reserved register R6) */
    this.reg.IS = this.reg[6];

    /* add alias for SP (reserved register R7) */
    this.reg.SP = this.reg[7];
    /* set register R7 (reserved) = F4 address in ram */
    this.reg.SP = 0xf4;

    this.bt = [];

    /* alphabetized instruction codes */

    const ADD = 0b10101000;

    const CALL = 0b01001000;

    const HLT = 0b00000001;

    const IRET = 0b00001011;

    const JMP = 0b01010000;

    const LDI = 0b10011001;

    const MUL = 0b10101010;

    const POP = 0b01001100;
    const PRA = 0b01000010;
    const PRN = 0b01000011;
    const PUSH = 0b01001101;

    const RET = 0b00001001;

    const ST = 0b10011010;

    /* alphabetized instructions */

    this.bt[ADD] = (opA, opB) => {
      this.alu('ADD', opA, opB);
    };

    this.bt[CALL] = (opA, opB) => {
      this.reg.PC += CALL >>> 6;
      this.bt[PUSH]('PC');

      this.reg.PC = this.reg[opA];

      return true;
    };

    this.bt[HLT] = _ => {
      this.stopClock();
    };

    this.bt[IRET] = _ => {
      //
    };

    this.bt[JMP] = (opA, opB) => {
      this.reg.PC = this.reg[opA];
    };

    this.bt[LDI] = (opA, opB) => {
      this.reg[opA] = opB;
    };

    this.bt[MUL] = (opA, opB) => {
      this.alu('MUL', opA, opB);
    };

    this.bt[POP] = (opA, opB) => {
      this.reg[opA] = this.ram.read(this.SP++);
    };

    this.bt[PRA] = opA => {
      console.log(String.fromCharCode(this.reg[opA]));
    };

    this.bt[PRN] = (opA, opB) => {
      console.log(this.reg[opA]);
    };

    this.bt[PUSH] = (opA, opB) => {
      this.ram.write(--this.SP, this.reg[opA]);
    };

    this.bt[RET] = _ => {
      this.bt[POP]('PC');
    };

    this.bt[ST] = (opA, opB) => {
      this.reg[opA] = this.reg[opB];
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

    this.keyboard = setInterval(_ => {
      console.log('keyboard!');
      _this.reg.IS = 0b00000001;
    }, 1000);
  }

  /**
   * Stops the clock
   */
  stopClock() {
    clearInterval(this.clock);
    clearInterval(this.keyboard);

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
      case 'ADD':
        this.reg[regA] += this.reg[regB];
        break;
    }
  }

  /**
   * Advances the CPU one cycle
   */
  tick() {
    /* re-set aliases */
    this.reg.IR = this.reg[5];
    this.reg.IS = this.reg[6];
    this.reg.SP = this.reg[7];

    /* check if interrupts are enabled  */
    if (this.reg.IR) {
      console.log('interrupts enabled!');
    }

    // Load the instruction register (IR--can just be a local variable here)
    // from the memory address pointed to by the PC. (I.e. the PC holds the
    // index into memory of the next instruction.)

    const IR = this.ram.read(this.reg.PC);

    // Debugging output
    let debug;
    debug = true; /* un/comment this line only */
    debug || false
      ? console.log(
          `${this.reg.PC}:${this.reg.PC < 10 ? ' ' : ''} ${IR.toString(2)
            .split('')
            .reverse()
            .concat(new Array(8 - IR.toString(2).length).fill('0'))
            .reverse()
            .join('')}`,
        )
      : null;

    // Get the two bytes in memory _after_ the PC in case the instruction
    // needs them.

    const operandA = this.ram.read(this.reg.PC + 1);
    const operandB = this.ram.read(this.reg.PC + 2);

    // Execute the instruction. Perform the actions for the instruction as
    // outlined in the LS-8 spec.

    if (!this.bt[IR]) {
      console.error(
        `ERROR: instruction ${IR.toString(2)
          .split('')
          .reverse()
          .concat(new Array(8 - IR.toString(2).length).fill('0'))
          .reverse()
          .join('')} at ${this.reg.PC} not found`,
      );
      this.bt[0b00000001](); /* HALT */
      return;
    }

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
