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

    /* Internal Registers */
    this.IR = 0b0000000; /* Instruction Register */
    // Special-purpose registers
    this.reg.PC = 0; // Program Counter
    this.reg.FL = 0b0000000; /* Flag status  */

    /* Reserved Registers */
    /* set alias for IM register (reserved register R5) */
    this.reg[5] = 0b0000000;
    this.IM = 5; /* alias for IM register */

    /* add alias for IS register (reserved register R6) */
    this.reg[6] = 0b0000000;
    this.IS = 6; /* alias for IM register */

    /* add alias for SP (reserved register R7) */
    this.reg[7] = 0xf4; /* set register R7 (reserved) = F4 address in ram */
    this.SP = 7; /* alias for SP register */

    /* Tables */
    this.bt = [];
    this.vt = [];
    this.it = [];

    /* Branch Table */
    /* alphabetized instruction codes */

    const ADD = 0b10101000;

    const CALL = 0b01001000;
    const CMP = 0b10100000;

    const HLT = 0b00000001;

    const IRET = 0b00001011;

    const JEQ = 0b01010001;
    const JMP = 0b01010000;
    const JNE = 0b01010010;

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
      this.reg[opA] = this.alu('ADD', this.reg[opA], this.reg[opB]);
    };

    this.bt[CALL] = opA => {
      this.reg.PC += CALL >>> 6;
      this.bt[PUSH]('PC');

      this.reg.PC = this.reg[opA];

      return true;
    };

    this.bt[CMP] = (opA, opB) => {
      this.reg.FL = this.alu('CMP', this.reg[opA], this.reg[opB]);
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

    this.bt[JEQ] = opA => {
      if (((this.reg.FL >> 0) & 1) === 1) return this.bt[JMP](opA);
    };

    this.bt[JMP] = opA => {
      this.reg.PC = this.reg[opA];

      return true;
    };

    this.bt[JNE] = opA => {
      if (((this.reg.FL >> 0) & 1) === 0) return this.bt[JMP](opA);
    };

    this.bt[LDI] = (opA, opB) => {
      this.reg[opA] = opB;
    };

    this.bt[MUL] = (opA, opB) => {
      this.reg[opA] = this.alu('MUL', this.reg[opA], this.reg[opB]);
    };

    this.bt[POP] = opA => {
      this.reg[opA] = this.ram.read(this.reg[this.SP]++);
    };

    this.bt[PRA] = opA => {
      console.log(String.fromCharCode(this.reg[opA]));
    };

    this.bt[PRN] = opA => {
      console.log(this.reg[opA]);
    };

    this.bt[PUSH] = opA => {
      this.ram.write(--this.reg[this.SP], this.reg[opA]);
    };

    this.bt[RET] = _ => {
      this.bt[POP]('PC');
    };

    this.bt[ST] = (opA, opB) => {
      this.ram.write(this.reg[opA], this.reg[opB]);
    };

    /* Vector Table */
    const IO = 0;
    const I1 = 1;
    const I2 = 2;
    const I3 = 3;
    const I4 = 4;
    const I5 = 5;
    const I6 = 6;
    const I7 = 7;

    /* vt or interrupt vector table */
    this.vt[IO] = 0xf8;
    this.vt[I1] = 0xf9;
    this.vt[I2] = 0xfa;
    this.vt[I3] = 0xfb;
    this.vt[I4] = 0xfc;
    this.vt[I5] = 0xfd;
    this.vt[I6] = 0xfe;
    this.vt[I7] = 0xff;

    /* Interrupt Table */
    const KEYBOARDINTERRUPT = 'KEYBOARDINTERRUPT';
    const INTERRUPT = 'INTERRUPT';
    const KEYBOARD = 'KEYBOARD';

    this.it[KEYBOARDINTERRUPT] = _ => {
      // TODO *****************************************************************
    };

    this.it[INTERRUPT] = _ => {
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
          this.bt[PUSH]('PC'); /* PUSH */

          /* push FL register to stack */
          this.bt[PUSH]('FL'); /* PUSH */

          /* push R0 -> R1 -> ... -> R5 -> R6 to stack */
          for (let i = 0; i <= 6; i++) {
            this.bt[PUSH](i); /* PUSH */
          }

          /* look up appropiate handler from interrupt vector table */
          const v = this.vt[interruptBit];

          /* set PC to handler address */
          this.reg.PC = this.ram.read(v);
          return true;
        }
      }
      return false;
    };

    this.it[KEYBOARD] = _ => {
      // TODO *****************************************************************
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

    this.timerInterrupt = setInterval(_ => {
      _this.reg[this.IS] = 0b00000001; /* R6 is the IS register */
    }, 1000);
  }

  /**
   * Stops the clock
   */
  stopClock() {
    clearInterval(this.clock);
    clearInterval(this.timerInterrupt);

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
      case 'ADD':
        return (regA += regB);
      case 'MUL':
        return (regA *= regB);
      case 'CMP':
        if (regA - regB > 0) return 0b00000010;
        if (regA - regB < 0) return 0b00000100;
        return 0b00000001;
    }
  }

  /**
   * Advances the CPU one cycle
   */
  tick() {
    /* stop cpu clock after 10 'seconds' */
    if (++this.cycle > 10000) {
      this.bt[0b00000001](); /* HALT */
      return;
    }

    /* check if bit 0 and 1 of the IS are set */
    // TODO *******************************************************************
    // if (
    //   ((this.reg[this.IS] >> 0) & 1) === 1 &&
    //   ((this.reg[this.IS] >> 0) & 1) === 1 &&
    //   this.it['KEYBOARDINTERRUPT']()
    // )
    //   return;

    /* check if bit 0 of the IS is set */
    if (((this.reg[this.IS] >> 0) & 1) === 1 && this.it['INTERRUPT']()) return;

    /* check if bit 1 of the IS is set */
    // TODO *******************************************************************
    // if (((this.reg[this.IS] >> 1) & 1) === 1 && this.it['KEYBOARD']()) return;

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
            .concat(new Array(8 - this.IR.toString(2).length).fill('0'))
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

    if (this.bt[this.IR](operandA, operandB)) return;

    // Increment the PC register to go to the next instruction. Instructions
    // can be 1, 2, or 3 bytes long. Hint: the high 2 bits of the
    // instruction byte tells you how many bytes follow the instruction byte
    // for any particular instruction.

    this.reg.PC += 1 + (this.IR >>> 6);
  }
}

module.exports = CPU;
