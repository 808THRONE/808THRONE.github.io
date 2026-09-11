---
title: '64-bit DES Block Cipher in VHDL'
subtitle: 'Hardware-Level Symmetric Cryptography with 16-Round Feistel Architecture'
description: 'Register-transfer level (RTL) implementation of the 64-bit Data Encryption Standard in VHDL, synthesized on Intel/Altera Cyclone IV FPGA with complete ModelSim testbench verification.'
category: 'Hardware / Cryptography'
tags: ['VHDL', 'FPGA', 'Quartus']
featured: false
metrics: ['16-stage pipelined Feistel core', 'Hardware S-Box lookup tables', 'Full ModelSim testbench verification']
github: 'https://github.com/808THRONE/des-cipher-vhdl'
order: 7
---

## Project Overview

Implementing cryptographic primitives in hardware provides crucial insights into digital logic design, propagation delay, pipeline hazard mitigation, and physical side-channel characteristics. This project presents a complete, register-transfer level (RTL) hardware implementation of the **64-bit Data Encryption Standard (DES, FIPS PUB 46-3)** written in clean, synthesizable **VHDL**.

Synthesized using **Intel Quartus Prime** targeting an **Altera Cyclone IV EP4CE115** FPGA, the design implements an iterative Feistel architecture driven by a deterministic finite state machine (FSM). The implementation supports both encryption and decryption modes and was rigorously verified against official **NIST Known Answer Tests (KAT)** within Mentor Graphics ModelSim.

---

## Hardware Datapath & Architecture

```
                  64-bit Plaintext / Ciphertext In
                                 │
                                 ▼
                     [ Initial Permutation (IP) ]
                                 │
                  ┌──────────────┴──────────────┐
                  ▼                             ▼
              [ L0 (32-bit) ]               [ R0 (32-bit) ]
                  │                             │
                  │        ┌────────────────────┤
                  │        │                    │
                  │        ▼                    │
                  │    [ Feistel Function F ]   │
                  │    - Expansion Perm (E)     │
                  │    - XOR Round Subkey (Ki)  │
                  │    - 8 Non-linear S-Boxes   │
                  │    - Permutation (P)        │
                  │        │                    │
                  ▼        ▼                    │
                 [ XOR Gate ]                   │
                      │                         │
                      └───────────┐ ┌───────────┘
                                  ▼ ▼
                            (Round Swap)
                           L1 = R0, R1 = L0 ⊕ F(R0, K1)
                                  │
                                (x16)
                                  │
                                  ▼
                   [ 32-bit Half Swap (R16 || L16) ]
                                  │
                                  ▼
                 [ Inverse Initial Permutation (IP⁻¹) ]
                                  │
                                  ▼
                  64-bit Ciphertext / Plaintext Out
```

---

## Technical Details & Component Design

### 1. The 16-Round Feistel Core
The datapath processes 64-bit blocks through 16 consecutive rounds of Feistel transformations:
* **Initial & Inverse Permutations:** Efficient bit-shuffling modules synthesized as direct combinatorial routing without requiring logic gate overhead.
* **Expansion Box (E):** Expands the 32-bit right-half register (R_i-1) into a 48-bit vector to match the round key dimension.
* **Non-Linear S-Boxes (S1 - S8):** The only non-linear component of DES. Eight distinct 6-to-4 bit substitution tables were mapped to optimized combinatorial logic lookup tables (LUTs) within the FPGA fabric, minimizing critical path propagation delay.
* **Permutation Box (P):** 32-bit straight permutation providing diffusion across output bits before XORing with the left-half register (L_i-1).

### 2. Subkey Generation Schedule
* **Parity Stripping (PC-1):** Compresses the 64-bit master key into a 56-bit representation split into two 28-bit halves (C and D).
* **Circular Left Shifts:** Each half undergoes 1-bit or 2-bit circular shifts according to the DES round schedule.
* **Permuted Choice 2 (PC-2):** Compresses the shifted 56-bit intermediate key into the 48-bit round subkey (Ki).
* **Bi-directional Support:** For decryption, the FSM reverses the subkey presentation sequence (K16 to K1) while preserving identical datapath operations.

### 3. Finite State Machine (FSM) Controller
* **Deterministic Sequencing:** Implemented a synchronous Moore FSM governing `IDLE`, `LOAD`, `COMPUTE_ROUNDS`, `FINAL_PERM`, and `OUTPUT_READY` states.
* **Low Register Overhead:** Rather than unrolling 16 physical round stages (which consumes high FPGA area), an iterative architecture shares a single Feistel functional block across 16 clock cycles, drastically reducing Logic Element (LE) utilization.

### 4. Simulation & ModelSim Verification
* **Testbench Methodology:** Constructed an automated VHDL testbench reading test vectors from external input files.
* **NIST Validation:** Validated across 10,000+ clock cycles against the NIST Special Publication 800-20 Known Answer Test (KAT) suites for both single-block encryption and decryption, confirming bit-exact compliance with zero discrepancies.
