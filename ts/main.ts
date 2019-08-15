let OP_ADD  = 0x00;
let OP_LDI  = 0x01;
let OP_BNE  = 0x02;
let OP_LD   = 0x03;


function CODE(op: number, dst: number, src1: number, src2: number) {
    return (op << 24) | (dst << 16) | (src1 << 8) | (src2 << 0);
}

const insns = [
    CODE(OP_LDI,  1, 0, 0),  // LDI x1 <= 0     // counter
    CODE(OP_LDI,  2, 1, 0),  // LDI x2 <= 1     // constant 1
    CODE(OP_LD,   3, 1, 0),  // LD  x3 <= [x1]  // loop end
    CODE(OP_LDI,  4, 0, 0),  // LDI x4 <= 0     // accumulator
// 4
    CODE(OP_LD,   5, 1, 0),  // LD  x5 <= [x1]      // load a value
    CODE(OP_ADD,  4, 4, 5),  // ADD x4 <= x4 + x5   // accumulate
    CODE(OP_ADD,  1, 1, 2),  // ADD x1 <= x1 + x2   // increment the counter
    CODE(OP_BNE,  1, 3, 4),  // BNE x1 != x2, 4(PC) // Loop
];

let reg = new Array<number>(0x20);
let mem = new Array<number>(0x10000);
mem[0] = 0x10000;

function GetOpCode(insn: number)     {       return (insn >> 24) & 0xff; }
function GetDstOperand(insn: number) {       return (insn >> 16) & 0x1f; }
function GetFirstSrcOperand(insn: number){   return (insn >> 8) & 0x1f;  }
function GetSecondSrcOperand(insn: number){  return (insn >> 0) & 0x1f;  }

function OpADD(pc: number, dst: number, src1: number, src2: number){
    reg[dst] = reg[src1] + reg[src2];
    return pc + 1;
}

function OpLDI(pc: number, dst: number, src1: number, src2: number){
    reg[dst] = src1;
    return pc + 1;
}

function OpLD(pc: number, dst: number, src1: number, src2: number){
    reg[dst] = mem[reg[src1]];
    return pc + 1;
}

function OpBNE(pc: number, dst: number, src1: number, src2: number){
    return reg[dst] != reg[src1] ? src2 : (pc + 1);
}


function body() {
    let pc = 0;
    while(pc != 8){
        let code = insns[pc];
        let op = GetOpCode(code);
        let dst = GetDstOperand(code);
        let src1 = GetFirstSrcOperand(code);
        let src2 = GetSecondSrcOperand(code);
        switch (op) {
        case OP_ADD:    pc = OpADD(pc, dst, src1, src2); break;
        case OP_LDI:    pc = OpLDI(pc, dst, src1, src2); break;
        case OP_LD:     pc = OpLD(pc, dst, src1, src2); break;
        case OP_BNE:    pc = OpBNE(pc, dst, src1, src2); break;
        default:
            return false;
        }
    }
    return true;
}

function body_compiled(){
    let pc = 0;

    pc = OpLDI(pc, 1, 0, 0);   // CODE(OP_LDI,  1, 0, 0),  // LDI x1 <= 0     // counter
    pc = OpLDI(pc, 2, 1, 0);   // CODE(OP_LDI,  2, 1, 0),  // LDI x2 <= 1     // constant 1
    pc = OpLD (pc, 3, 1, 0);   // CODE(OP_LD,   3, 1, 0),  // LD  x3 <= [x1]  // loop end
    pc = OpLDI(pc, 4, 0, 0);   // CODE(OP_LDI,  4, 0, 0),  // LDI x4 <= 0     // accumulator

    while(pc != 8) {
        pc = OpLD (pc, 5, 1, 0);  // CODE(OP_LD,   5, 1, 0),  // LD  x5 <= [x1]      // load a value
        pc = OpADD(pc, 4, 4, 5);  // CODE(OP_ADD,  4, 4, 5),  // ADD x4 <= x4 + x5   // accumulate
        pc = OpADD(pc, 1, 1, 2);  // CODE(OP_ADD,  1, 1, 2),  // ADD x1 <= x1 + x2   // increment the counter
        pc = OpBNE(pc, 1, 3, 4);  // CODE(OP_BNE,  1, 3, 4),  // BNE x1 != x2, 4(PC) // Loop
    }

   return true;
}

function main(){
    const RAND_MAX = 0x7fffffff;
    for (let i = 1; i < 0x10000; i++) { // i does not start from 0
        mem[i] = (Math.random() * RAND_MAX) & RAND_MAX | 0;
    }
    for (let i = 0; i < 0x20; i++) {
        reg[i] = 0;
    }

    for (let i = 0; i < 10000; i++) {
        //if (!body()) {
        if (!body_compiled()) {
            console.log("Unknown op code\n");
            return 1;
        }
    }

    let sum = 0;
    for (let i = 0; i < 0x10000; i++) {
        sum += mem[i];
    }
    console.log("[%s], Correct: %d, Executed: %d\n", sum == reg[4] ? "OK" : "NG", sum, reg[4]);


    return 0;
}
main();

