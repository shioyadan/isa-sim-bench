import random

OP_ADD  = int(0x00)
OP_LDI  = int(0x01)
OP_BNE  = int(0x02)
OP_LD   = int(0x03)


def CODE(op, dst, src1, src2):
    return (op << 24) | (dst << 16) | (src1 << 8) | (src2 << 0)

insns = [
    CODE(OP_LDI,  1, 0, 0),  # LDI x1 <= 0     // counter
    CODE(OP_LDI,  2, 1, 0),  # LDI x2 <= 1     // constant 1
    CODE(OP_LD,   3, 1, 0),  # LD  x3 <= [x1]  // loop end
    CODE(OP_LDI,  4, 0, 0),  # LDI x4 <= 0     // accumulator
# 4
    CODE(OP_LD,   5, 1, 0),  # LD  x5 <= [x1]      // load a value
    CODE(OP_ADD,  4, 4, 5),  # ADD x4 <= x4 + x5   // accumulate
    CODE(OP_ADD,  1, 1, 2),  # ADD x1 <= x1 + x2   // increment the counter
    CODE(OP_BNE,  1, 3, 4),  # BNE x1 != x3, 4(PC) // Loop
]

reg = [0] * 0x20
mem = [0] * 0x10000
mem[0] = 0x10000

def GetOpCode(insn):
    return (insn >> 24) & 0xff
def GetDstOperand(insn):
    return (insn >> 16) & 0x1f
def GetFirstSrcOperand(insn):
    return (insn >> 8) & 0x1f
def GetSecondSrcOperand(insn):
    return (insn >> 0) & 0x1f

def OpADD(pc, dst, src1, src2):
    reg[dst] = reg[src1] + reg[src2]
    return pc + 1

def OpLDI(pc, dst, src1, src2):
    reg[dst] = src1
    return pc + 1

def OpLD(pc, dst, src1, src2):
    reg[dst] = mem[reg[src1]]
    return pc + 1

def OpBNE(pc, dst, src1, src2):
    return src2 if reg[dst] != reg[src1] else (pc + 1)

def body():
    pc = 0
    while(pc != 8):
        code = insns[pc]
        op = GetOpCode(code)
        dst = GetDstOperand(code)
        src1 = GetFirstSrcOperand(code)
        src2 = GetSecondSrcOperand(code)
        if op == OP_ADD:
            pc = OpADD(pc, dst, src1, src2)
        elif op == OP_LDI:
            pc = OpLDI(pc, dst, src1, src2)
        elif op == OP_LD:
            pc = OpLD(pc, dst, src1, src2)
        elif op == OP_BNE:
            pc = OpBNE(pc, dst, src1, src2)
        else:
            return False
    return True

def main():
    RAND_MAX = 0x7fffffff
    for i in range(1, 0x10000):
        mem[i] = int(random.random() * RAND_MAX) & RAND_MAX | 0

    count = 100
    for i in range(0, count):
        if (not body()):
            print("Unknown op code")
            return 1

    sum = 0
    for i in range(0, 0x10000):
        sum += mem[i]
    print("Python interpreter: loop=%d: [%s], Correct: %d, Executed: %d\n" % (count,"OK" if sum == reg[4] else "NG", sum, reg[4]))


    return 0

main()

