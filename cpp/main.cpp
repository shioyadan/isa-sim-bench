#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

const int32_t OP_ADD  = 0x00;
const int32_t OP_LDI  = 0x01;
const int32_t OP_BNE  = 0x02;
const int32_t OP_LD   = 0x03;

constexpr int32_t CODE(int32_t op, int32_t dst, int32_t src1, int32_t src2) {
    return (op << 24) | (dst << 16) | (src1 << 8) | (src2 << 0);
}

uint32_t insns[0x10000] = {
    CODE(OP_LDI,  1, 0, 0),  // LDI x1 <= 0     // counter
    CODE(OP_LDI,  2, 1, 0),  // LDI x2 <= 1     // constant 1
    CODE(OP_LD,   3, 1, 0),  // LD  x3 <= [x1]  // loop end
    CODE(OP_LDI,  4, 0, 0),  // LDI x4 <= 0     // accumulator
// 4
    CODE(OP_LD,   5, 1, 0),  // LD  x5 <= [x1]      // load a value
    CODE(OP_ADD,  4, 4, 5),  // ADD x4 <= x4 + x5   // accumulate
    CODE(OP_ADD,  1, 1, 2),  // ADD x1 <= x1 + x2   // increment the counter
    CODE(OP_BNE,  1, 3, 4),  // BNE x1 != x3, 4(PC) // Loop
};

int32_t reg[0x20];
int32_t mem[0x10000] = {
    0x10000
};

uint32_t GetOpCode(uint32_t insn)     {       return (insn >> 24) & 0xff; }
uint32_t GetDstOperand(uint32_t insn) {       return (insn >> 16) & 0x1f; }
uint32_t GetFirstSrcOperand(uint32_t insn){   return (insn >> 8) & 0x1f;  }
uint32_t GetSecondSrcOperand(uint32_t insn){  return (insn >> 0) & 0x1f;  }

int32_t OpADD(uint32_t pc, uint32_t dst, uint32_t src1, uint32_t src2){
    reg[dst] = reg[src1] + reg[src2];
    return pc + 1;
}

int32_t OpLDI(uint32_t pc, uint32_t dst, uint32_t src1, uint32_t src2){
    reg[dst] = src1;
    return pc + 1;
}

int32_t OpLD(uint32_t pc, uint32_t dst, uint32_t src1, uint32_t src2){
    reg[dst] = mem[reg[src1]];
    return pc + 1;
}

int32_t OpBNE(uint32_t pc, uint32_t dst, uint32_t src1, uint32_t src2){
    return reg[dst] != reg[src1] ? src2 : (pc + 1);
}

bool body(){
    int32_t pc = 0;
    while(pc != 8){
        uint32_t code = insns[pc];
        uint32_t op = GetOpCode(code);
        uint32_t dst = GetDstOperand(code);
        uint32_t src1 = GetFirstSrcOperand(code);
        uint32_t src2 = GetSecondSrcOperand(code);
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

int main(){
    for (int i = 1; i < 0x10000; i++) { // i does not start from 0
        mem[i] = rand();
    }
    for (int i = 0; i < 0x20; i++) {
        reg[i] = 0;
    }

    int count = 10000;
    for (int i = 0; i < count; i++) {
        if (!body()) {
            printf("Unknown op code\n");
            return 1;
        }
    }

    int sum = 0;
    for (int i = 0; i < 0x10000; i++) {
        sum += mem[i];
    }
    printf("C++ interpreter: loop=%d: [%s], Correct: %d, Executed: %d\n", count, sum == reg[4] ? "OK" : "NG", sum, reg[4]);
    return 0;
}

