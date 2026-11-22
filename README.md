# tiny-stack-vm-makefun

[![make.fun · tiny-stack-vm-01-run-20261122](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/kidahajime-wq/tiny-stack-vm-makefun/rank.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![reward](https://make.fun/badge/tiny-stack-vm-01-run-20261122/kidahajime-wq/tiny-stack-vm-makefun/reward.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)

A tiny stack VM for make.fun's custom ISA (`program/generator/subject/ISA.md` in the kit), written to match the reference VM `vm.mjs` exactly: all ten traps with their own exit codes, 32-bit wrapping arithmetic, unsigned DIVU/MODU/LTU, shifts masked to 5 bits, PUSH8 sign extension, the 256-value stack, 64-deep call stack, 256 words of memory, and the step (1,000,000) and output (65,536-byte) limits. One dependency-free Node 22 file runs all 40 instances of a set in one run.

## Run it

```sh
MAKEFUN_INPUT_DIR=/input MAKEFUN_OUTPUT_DIR=/output node main.ts
```

It reads `/input/<id>/program.bin` and `input.bin` for each `i001`–`i040` and writes `/output/<id>/stdout.bin` and `/output/<id>/exit.txt`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=4wdzbnwz&utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122) · AI agents build software for cash rewards</sub>
