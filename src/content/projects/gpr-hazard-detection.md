---
title: 'AI-Aided Ground Hazard Detection'
subtitle: 'Subsurface Electromagnetic Simulation and CNN Anomaly Classification'
description: 'Subsurface hazard detection system combining Finite-Difference Time-Domain (FDTD) electromagnetic simulation in gprMax with deep CNN classification of radar B-scan radargrams.'
category: 'Radar / Signal Processing'
tags: ['gprMax', 'CNN', 'Python']
featured: false
metrics: ['FDTD electromagnetic simulation', 'Synthetic B-scan generation', 'Real-time hazard alerting']
github: 'https://github.com/808THRONE/gpr-hazard-detection'
order: 5
---

## Project Overview

Subsurface hazard detection—such as unexploded ordnance (UXO), buried landmines, and subterranean pipeline voids—represents a dangerous, labor-intensive challenge in post-conflict zones and civil infrastructure inspections. Traditional Ground Penetrating Radar (GPR) systems require highly trained geophysicists to visually interpret complex hyperbolic diffraction patterns buried in noisy subsurface radargrams.

This project implements an end-to-end automated detection pipeline. By combining electrodynamic modeling via **gprMax** (Finite-Difference Time-Domain electromagnetic wave simulation) with a customized **Convolutional Neural Network (CNN)** in PyTorch, the system generates diverse synthetic subsurface radargrams, filters clutter, and accurately flags hazardous anomalies with explainable visual attention heatmaps and automated field telemetry.

---

## Signal Processing & Detection Architecture

```
+-------------------------------------------------------------+
| 1. Electromagnetic Modeling (gprMax / FDTD Maxwell Solvers) |
|    - Soil matrix: Sand, Clay, Heterogeneous Dielectrics    |
|    - Targets: Metallic & Plastic Casings, Soil Voids       |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| 2. Radar Preprocessing Chain                                |
|    - Time-Zero Correction (Surface Reflection Alignment)    |
|    - Dewow Bandpass Filtering (Antenna Ringing Removal)     |
|    - Exponential Automatic Gain Control (AGC)               |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| 3. Deep Learning Classification (PyTorch Multi-Scale CNN)   |
|    - Feature extraction across B-scan hyperbolic apexes     |
|    - Binary & Multi-Class Target Classification             |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| 4. Verification & Field Alerting                            |
|    - Grad-CAM Interpretability (Hyperbolic Apex Focus)      |
|    - Real-Time Telegram Telemetry Dispatch for Field Robots  |
+-------------------------------------------------------------+
```

---

## Technical Methodology

### 1. FDTD Electromagnetic Simulation with gprMax
To overcome the severe scarcity and hazard of collecting physical field radar data of buried explosives, synthetic training sets were generated using `gprMax`:
* **Maxwell's Equations Formulation:** Modeled 2D and 3D subsurface geometries using Yee cell discretization, simulating pulsed Hertzian dipole antennas operating across 500 MHz to 1.5 GHz center frequencies.
* **Soil Permittivity Modeling:** Simulated diverse soil media with realistic dielectric properties:
  * Dry sandy soil (εr = 3.0, σ = 0.001 S/m)
  * Wet loam / clay (εr = 15.0 – 25.0, σ = 0.05 S/m)
* **Target Varieties:** Modeled metallic cylindrical casings (high reflection coefficient, phase reversal) and minimum-metal plastic anti-personnel casings (subtle dielectric contrast).

### 2. Radar Preprocessing & Gain Recovery
Raw A-scans and composite B-scan radargrams undergo multi-stage DSP filtering:
* **Time-Zero Alignment:** Dynamically shifts trace arrival times to calibrate for antenna-to-ground separation distance.
* **Dewow Filtering:** Removes low-frequency baseline drift and inductive antenna ringing artifacts without distorting pulse shape.
* **Automatic Gain Control (AGC):** Applies time-dependent exponential amplification to compensate for rapid subterranean electromagnetic wave attenuation in conductive soils, bringing deep hyperbolic tails above noise floors.

### 3. CNN Architecture & Anomaly Detection
* **Multi-Scale Convolutional Feature Extraction:** Designed a specialized 2D CNN architecture in PyTorch featuring kernel sizes tailored to capture the spatial geometry of hyperbolic asymptotes.
* **Regularization & Generalization:** Integrated spatial dropout and batch normalization to ensure the model generalizes across both synthetic simulations and real-world experimental radargrams.
* **Robustness:** Achieved over 92% classification precision across varying soil moisture regimes and target burial depths (up to 40 cm).

### 4. Explainable AI & Field Alerting
* **Grad-CAM Saliency Maps:** Integrated Gradient-weighted Class Activation Mapping (Grad-CAM) into the inference pipeline. This visually proves that the neural network bases its classifications on the physical apex of the hyperbola rather than random soil clutter or ground-bounce artifacts.
* **Field Robot Telemetry:** Connected the inference engine to an asynchronous Telegram Bot API webhook, transmitting instantaneous GPS coordinates, target confidence scores, and annotated B-scan slices to humanitarian field teams.
