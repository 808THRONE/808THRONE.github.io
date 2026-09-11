---
title: 'ScreenLens'
subtitle: 'Dual-Camera Retail Edge AI & Gaze Tracking on Jetson Orin Nano'
description: 'Dual-camera retail computer vision pipeline combining InStoreLens footfall analytics and FocusTrack gaze estimation, optimized for embedded edge deployment on NVIDIA Jetson hardware.'
category: 'AI / Computer Vision'
tags: ['Python', 'MediaPipe', 'TensorRT']
image: '/assets/project_screenlens.jpg'
github: 'https://github.com/808THRONE/screenlens'
featured: true
metrics: ['22.8 FPS on Jetson Orin Nano', '40% Compute reduction via landmark reuse', 'Sub-50ms inference latency']
order: 1
---

## Project Overview

**ScreenLens** is an edge-based retail intelligence system developed as an end-of-study engineering graduation project at **Screenflex** (Tunis, Tunisia). The system bridges the gap between physical retail spaces and digital analytics by delivering real-time audience engagement measurement and demographic analytics directly on resource-constrained embedded edge hardware.

Physical retailers have historically operated without the granular feedback loops common in e-commerce—such as impressions, bounce rates, dwell times, and demographic heatmaps. While cloud-connected video streaming solutions exist, they present major latency spikes, unsustainable bandwidth costs, and serious privacy compliance violations under GDPR and the EU Artificial Intelligence Act.

ScreenLens solves these challenges by running completely on-premise on the **NVIDIA Jetson Orin Nano** (15 W power profile), decoupling video processing into two complementary pipelines: **InStoreLens** and **FocusTrack**.

---

## Dual Pipeline Architecture

```
                      +-----------------------------+
                      |   Dual V4L2 Video Feeds     |
                      +--------------+--------------+
                                     |
               +---------------------+---------------------+
               |                                           |
               v                                           v
    [ InStoreLens Pipeline ]                    [ FocusTrack Pipeline ]
   Wide-Angle Overhead Camera                    Eye-Level Display Camera
               |                                           |
       Multi-Object Tracking                        Face Detection &
      & Demographic Estimation                       Landmark Extraction
               |                                           |
    MiVOLO Vision Transformer                     Landmark Cache & Reuse
        (TensorRT FP16)                           (Bypasses Redundant Pass)
               |                                           |
       Temporal Smoothing &                        Head Pose & 3D Gaze
     Trajectory Disambiguation                       Vector Analysis
               |                                           |
               +---------------------+---------------------+
                                     |
                                     v
                       +---------------------------+
                       | Engagement State Machine  |
                       | (Glance / Dwell / Focus)  |
                       +-------------+-------------+
                                     |
                                     v
                       +---------------------------+
                       | Anonymized Telemetry JSON |
                       | (Zero Frame Retention)   |
                       +---------------------------+
```

### 1. InStoreLens: Footfall & Demographic Intelligence
InStoreLens monitors wide-angle overhead perspectives to understand customer traffic density and store demographics:
* **Multi-Target Spatial Tracking:** Implemented Kalman filter-based trajectory tracking with Hungarian assignment to track individual paths through store corridors without ID switching.
* **Fine-Tuned MiVOLO Architecture:** Deployed a fine-tuned MiVOLO (Multi-input Vision Transformer for Age and Gender Estimation) network operating simultaneously on cropped face and body bounding boxes, compensating for steep camera angles and partial occlusions.
* **Temporal Smoothing:** Applied rolling Bayesian filters over temporal window frames, filtering out single-frame classification flicker and stabilizing demographic distributions.

### 2. FocusTrack: Gaze & Audience Attention Estimation
FocusTrack operates from digital display shelf-mounts and interactive kiosks to quantify shopper engagement:
* **Head Pose Estimation:** Computes continuous Euler angles (Yaw, Pitch, Roll) from 3D facial mesh points using Perspective-n-Point (PnP) pose solving.
* **Gaze Cone of Regard:** Evaluates eye pupil vector displacement relative to screen coordinate boundaries to verify whether a shopper is actively viewing the screen content.
* **Engagement State Machine:** Categorizes visitor interaction into discrete stages:
  * **Glance:** < 1.0s dwell within display orientation.
  * **Dwell:** 1.0s – 3.0s sustained head alignment.
  * **Engaged Focus:** > 3.0s continuous direct gaze verification.

---

## Technical Innovations & Engineering Highlights

### The Landmark Reuse Optimization (40% Compute Cut)
In conventional multi-stage facial pipelines, face detection runs first to generate bounding boxes, followed immediately by a second landmark detection pass to compute facial alignment. When feeding frames to downstream gaze and head pose estimation, standard libraries repeat detection routines.

By instrumenting the pipeline to extract, cache, and re-project 468 dense 3D facial landmarks from the tracking layer into normalized face coordinate space, FocusTrack completely bypassed the secondary face detection pass. This architectural refactor **reduced per-frame compute load by over 40%**, freeing critical GPU and Tensor Core cycles for ViT inference.

### TensorRT FP16 Acceleration on Jetson Orin Nano
The target production deployment hardware was the **NVIDIA Jetson Orin Nano Developer Kit** (6-core ARM Cortex-A78AE, 1024-core NVIDIA Ampere GPU, 32 Tensor Cores, 8 GB shared LPDDR5 memory).

* **Model Quantization:** Exported PyTorch vision backbones to static-dimension ONNX computational graphs and compiled dedicated TensorRT engines using FP16 precision.
* **Kernel Autotuning:** Profiled layer execution using TensorRT’s builder heuristics to select optimal matrix multiplication kernels for Ampere Tensor Cores.
* **Throughput Achieved:** Reached **22.8 FPS** for InStoreLens and **18.5 FPS** for FocusTrack at sub-50ms inference latency, comfortably exceeding the 15 FPS real-time threshold required for physical retail tracking.

### Multiprocessing & Backpressure Pipeline
Running high-resolution camera capture, deep learning inference, and GUI analytics visualization in a single Python thread causes severe GIL contention and dropped frames.

* **Decoupled Architecture:** Separated camera I/O, TensorRT inference workers, and the UI visualization thread across isolated operating system processes using Python `multiprocessing`.
* **Zero-Copy Shared Memory:** Shared raw frame buffers via `/dev/shm` (POSIX shared memory) using NumPy memory-mapped arrays, eliminating frame copying between processes.
* **Bounded FIFO Backpressure:** Built bounded queues with strict drop-oldest policies. If inference experiences transient latency spikes, capture processes drop stale intermediate frames rather than accumulating queue latency, ensuring live analytics remain strictly real-time.

### Privacy-by-Design by Architecture
To guarantee strict compliance with international biometric privacy legislation:
* **Volatile-Only Memory:** Video frames and facial crops reside exclusively in volatile RAM and POSIX shared memory buffers.
* **Zero Disk Persistence:** No raw video footage, cropped facial imagery, or identifiable biometric embeddings are ever written to disk or transmitted over network interfaces.
* **Aggregated Metadata Serialization:** Edge nodes emit only lightweight, anonymized telemetry payloads (e.g., `{"timestamp": 1788950400, "zone_id": 4, "dwell_seconds": 4.2, "age_bracket": "25-34", "engagement": "high"}`).

---

## Hardware Benchmarks & Performance Comparison

| Metric / Hardware Target | x86_64 Dev Baseline (i7 + RTX 4070) | Raspberry Pi 5 (Quad-Core A76) | NVIDIA Jetson Orin Nano (15 W Profile) |
| :--- | :--- | :--- | :--- |
| **InStoreLens Pipeline Throughput** | 58.4 FPS | 4.2 FPS (CPU ONNX) | **22.8 FPS (TensorRT FP16)** |
| **FocusTrack Pipeline Throughput** | 46.1 FPS | 3.8 FPS (CPU ONNX) | **18.5 FPS (TensorRT FP16)** |
| **End-to-End Latency** | 18 ms | 240 ms | **44 ms** |
| **Active Power Consumption** | ~280 W | ~11 W | **14.2 W** |
| **Relative Energy Efficiency** | 1.0x (Baseline) | 1.8x | **10.4x vs x86 Baseline** |

The benchmark demonstrates that the TensorRT FP16 compiled pipeline on the Jetson Orin Nano achieves greater than **ten times the energy efficiency** of the x86 workstation baseline while maintaining high real-time throughput.
