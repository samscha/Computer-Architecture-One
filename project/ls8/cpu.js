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
    this.cycle = 0;

    this.ram = ram;

    this.reg = new Array(8).fill(0); // General-purpose registers R0-R7

    // Special-purpose registers
    this.IR = 0b0000000; /* Instruction Register */
    this.reg.PC = 0; // Program Counter
    this.reg.FL = 0b0000000; /* Flag status  */

    /* set alias for IM register (reserved register R5) */
    this.reg[5] = 0b0000000;
    this.IM = 5; /* alias for IM register */

    /* add alias for IS register (reserved register R6) */
    this.reg[6] = 0b0000000;
    this.IS = 6; /* alias for IM register */

    /* add alias for SP (reserved register R7) */
    this.reg[7] = 0xf4; /* set register R7 (reserved) = F4 address in ram */
    this.SP = 7; /* alias for SP register */

    this.bt = [];
    this.vt = [];

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
      /* POP R6 -> R5 -> ... -> R1 -> R0 */
      for (let i = 6; i <= 0; i--) {
        this.bt[POP](i);
      }

      this.bt[POP]('FL');
      this.bt[POP]('PC');

      /* enable  interrupts */
      this.reg[5] = 0b00000001; /* equivalent to this.reg.IM = 1 */
      return true;
    };

    this.bt[JMP] = (opA, opB) => {
      this.reg.PC = this.reg[opA];

      return true;
    };

    this.bt[LDI] = (opA, opB) => {
      this.reg[opA] = opB;
    };

    this.bt[MUL] = (opA, opB) => {
      this.alu('MUL', opA, opB);
    };

    this.bt[POP] = (opA, opB) => {
      this.reg[opA] = this.ram.read(this.reg[this.SP]++);
    };

    this.bt[PRA] = opA => {
      console.log(String.fromCharCode(this.reg[opA]));
    };

    this.bt[PRN] = (opA, opB) => {
      console.log(this.reg[opA]);
    };

    this.bt[PUSH] = (opA, opB) => {
      this.ram.write(--this.reg[this.SP], this.reg[opA]);
    };

    this.bt[RET] = _ => {
      this.bt[POP]('PC');
    };

    this.bt[ST] = (opA, opB) => {
      this.ram.write(this.reg[opA], this.reg[opB]);
    };

    /* vt or interrupt vector table */

    this.vt[0] = 0xf8;
    this.vt[1] = 0xf9;
    this.vt[2] = 0xfa;
    this.vt[3] = 0xfb;
    this.vt[4] = 0xfc;
    this.vt[5] = 0xfd;
    this.vt[6] = 0xfe;
    this.vt[7] = 0xff;
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

    this.timerInterrupt = setInterval(_ => {
      _this.reg[6] = 0b00000001; /* R6 is the IS register */
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
    /* stop cpu clock after 10 seconds */
    if (++this.cycle > 10000) {
      this.bt[0b00000001](); /* HALT */
      return;
    }

    /* check if bit 0 of the IS is set */
    if (this.reg[this.IS]) {
      const interrupts = this.reg[this.IM] & this.reg[this.IS];

      if (interrupts) {
        let interruptHappened = false;
        let interruptBit = 0;

        for (let i = 0; i < 8; i++) {
          if (((interrupts >> i) & 1) === 1) {
            interruptBit = i;
            interruptHappened = true;
            break;
          }
        }

        if (interruptHappened) {
          /* disable further interrupts */
          this.reg[this.IM] = 0b00000000; /* equivalent to this.reg.IM = 0 */

          /* clear the bit in the IS register */
          this.reg[this.IS] = 0b00000000; /* equivalent to this.reg.IS = 0 */

          /* push PC register to stack */
          this.bt[0b01001101]('PC'); /* PUSH */

          /* push FL register to stack */
          this.bt[0b01001101]('FL'); /* PUSH */

          /* push R0 -> R1 -> ... -> R5 -> R6 to stack */
          for (let i = 0; i <= 6; i++) {
            this.bt[0b01001101](i); /* PUSH */
          }

          /* look up appropiate handler from interrupt vector table */
          const v = this.vt[interruptBit];

          /* set PC to handler address */
          this.reg.PC = this.ram.read(v);
          return;
        }
      }
    }

    // Load the instruction register (IR--can just be a local variable here)
    // from the memory address pointed to by the PC. (I.e. the PC holds the
    // index into memory of the next instruction.)

    this.IR = this.ram.read(this.reg.PC);

    /* check if IR is in bt */
    if (!this.bt[this.IR]) {
      console.error(
        `ERROR: instruction ${this.IR.toString(2)
          .split('')
          .reverse()
          .concat(new Array(8 - this.IR.toString(2).length).fill('0'))
          .reverse()
          .join('')} at ${this.reg.PC} not found`,
      );
      this.bt[0b00000001](); /* HALT */
      return;
    }

    // Debugging output
    let debug;
    // debug = true; /* un/comment this line only */
    debug || false
      ? console.log(
          `${this.reg.PC}:${this.reg.PC < 10 ? ' ' : ''} ${this.IR.toString(2)
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

    const endTick = this.bt[this.IR](operandA, operandB);

    // Increment the PC register to go to the next instruction. Instructions
    // can be 1, 2, or 3 bytes long. Hint: the high 2 bits of the
    // instruction byte tells you how many bytes follow the instruction byte
    // for any particular instruction.

    if (endTick) return;

    if (this.reg.IM) {
      // console.log('this.reg.IM exists and this.reg.PC is:', this.reg.PC);
      // console.log('this.cycle', this.cycle);
    }

    this.reg.PC += 1 + (this.IR >>> 6);
  }
}

module.exports = CPU;
