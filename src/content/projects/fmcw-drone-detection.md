---
title: 'Lightweight Drone Detection with FMCW Radar'
subtitle: 'Micro-Doppler Signature Extraction and Edge CNN Inference for Micro-UAVs'
description: 'Compact radar surveillance pipeline using Frequency Modulated Continuous Wave (FMCW) radar, micro-Doppler time-frequency analysis, and edge-optimized CNNs to classify low-RCS micro-UAVs.'
category: 'Radar / Signal Processing'
tags: ['FMCW', 'Doppler', 'PyTorch']
featured: false
metrics: ['FFT Range-Doppler processing', 'Micro-Doppler signature extraction', 'Low-power edge CNN classifier']
github: 'https://github.com/808THRONE/fmcw-drone-detection'
order: 6
---

## Project Overview

The proliferation of consumer and industrial micro-Unmanned Aerial Vehicles (UAVs / drones) introduces critical security challenges for sensitive airspaces, industrial complexes, and public gatherings. Because commercial micro-drones possess minimal Radar Cross Sections (RCS) and often fly at low altitudes beneath conventional airspace radar coverage, optical cameras or acoustic sensors struggle under poor lighting, fog, or environmental acoustic noise.

This project implements a lightweight, radar-based drone surveillance and classification system. Utilizing **Frequency Modulated Continuous Wave (FMCW)** radar principles, the pipeline isolates moving airborne targets via 2D-FFT Range-Doppler mapping and extracts distinctive **micro-Doppler signatures** caused by rotating carbon-fiber and plastic propeller blades. A compact **5-layer CNN** in PyTorch classifies drone targets from birds, ground vehicles, and clutter with ultra-low latency on embedded edge processors.

---

## Radar Signal Processing Chain

```
               [ Transmitted Linear Chirp (FMCW) ]
                              │
                    (Echoes from Moving UAV)
                              │
                              ▼
                [ Mixer / Dechirping Stage ]
                              │
                [ Intermediate Frequency (IF) ]
                              │
                              ▼
            [ Fast-Time Range FFT (Distance) ]
                              │
                              ▼
          [ Slow-Time Doppler FFT (Velocity) ]
                              │
                              ▼
         [ 2D Range-Doppler Map (RDM) Output ]
                              │
                              ▼
      [ CA-CFAR Adaptive Threshold Detection ]
                              │
                              ▼
        [ Micro-Doppler Time-Frequency STFT ]
        (Rotor Blade Harmonic Modulation Bands)
                              │
                              ▼
          [ Lightweight 5-Layer PyTorch CNN ]
       (Micro-UAV vs Birds vs Environmental Clutter)
```

---

## Technical Highlights & Implementation

### 1. FMCW Radar Principles & Dechirping
The system simulates and analyzes linear frequency-modulated chirps operating in the 24 GHz ISM / 77 GHz mmWave bands:
* **Chirp Dechirping:** Received radar echoes are mixed with a replica of the transmitted chirp signal, yielding an Intermediate Frequency (IF) beat signal whose frequency directly corresponds to target range.
* **Range-Doppler Processing:**
  * **Range FFT:** Processed along fast-time samples within a single chirp to determine target range bins.
  * **Doppler FFT:** Computed across successive coherent chirps (slow-time dimension) to measure the bulk radial velocity and phase shift of moving objects.
* **CA-CFAR Target Slicing:** Implemented Cell-Averaging Constant False Alarm Rate (CA-CFAR) windowing with guard cells to maintain a constant false-alarm probability while detecting faint targets amidst dynamic background noise.

### 2. Micro-Doppler Spectral Analysis
While a drone’s airframe produces a single bulk radial velocity Doppler shift, its high-speed rotating rotor blades create periodic phase modulations called **micro-Doppler phenomena**:
* **Short-Time Fourier Transform (STFT):** Generated continuous spectrograms showing blade flash harmonics and symmetric sideband frequency spreads flanking the target's center velocity.
* **Feature Discrimination:** The distinct periodic harmonic spacing and blade tip velocities provide an unambiguous biometric signature that cleanly separates quadcopter drones from flapping avian wildlife, ground vehicles, or swaying trees.

### 3. Edge-Optimized 5-Layer CNN Classifier
To enable deployment on low-cost ARM SoCs and microcontroller edge DSPs without demanding expensive desktop GPUs:
* **Compact Architecture:** Designed a minimalist 5-layer convolutional network consuming less than 1.2 MB of parameter memory.
* **Input Representation:** Feed normalized micro-Doppler spectrogram crops into the network.
* **Edge Performance:** Achieved 94.6% classification accuracy across varying flight speeds and hover modes, completing single-frame classification in under 12 ms on embedded ARM targets.
