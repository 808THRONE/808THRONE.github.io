---
title: 'Accelerating Vision Transformers on NVIDIA Jetson Orin Nano'
description: 'How we achieved 22.8 FPS with MiVOLO and Face-body ViTs on resource-constrained embedded hardware using FP16 TensorRT quantization, landmark reuse, and zero-copy shared memory queues.'
category: 'AI / Computer Vision'
pubDate: 2026-08-20
image: '/assets/project_screenlens.jpg'
tags: ['Edge AI', 'TensorRT', 'Jetson', 'Computer Vision']
featured: true
readingTime: '7 min read'
author: 'Iheb Brahmi'
---

## The Challenge: ViT on 15W Embedded Silicon

During my engineering work on the **ScreenLens** system at Screenflex, our mandate was straightforward yet formidable: execute real-time dual-camera demographic analytics (age, gender, engagement, head-pose estimation) on the **NVIDIA Jetson Orin Nano** (1024-core Ampere GPU, 8GB unified memory, 15W TDP).

While traditional convolutional networks (CNNs like MobileNetV3) run comfortably on edge devices, state-of-the-art demographic accuracy requires **Vision Transformers (ViT)**—specifically the **MiVOLO** (Multi-Input Vision Transformer for Open-Set Demographic Evaluation) architecture.

Running unmodified PyTorch ViT inference yielded **2.1 FPS** and over **480ms per-frame latency**—far below the 15+ FPS retail threshold. Here is how we engineered the optimization pipeline to achieve **22.8 FPS**.

---

## 1. Eliminating Redundant Face Detection via Facial Landmark Reuse

In the baseline pipeline, two independent computer vision models ran consecutively:
1. A face detection pass for demographic cropping.
2. A subsequent face landmark pass for gaze and head-pose tracking.

By modifying the landmark generator to extract the 68 canonical facial coordinates in a single initial pass, we computed the tight bounding box and rotation angle directly from the landmark extremes (`min(x)`, `max(x)`, inter-pupillary distance).

> **Impact:** This single architectural refactor eliminated 100% of the second face-detection model's compute load, reducing per-frame inference operations by **40%**.

---

## 2. Compiling Native TensorRT FP16 Engines

Standard PyTorch models incur significant Python GIL overhead and uncoalesced memory reads. To saturate the Orin Nano's Tensor Cores, we exported the transformer backbone to **ONNX** with dynamic batch dimensions, then compiled optimized **TensorRT FP16** execution engines.

```bash
# Export ONNX model with fixed input tensors for maximum optimization
python3 export_onnx.py --model mivolo_vit --output mivolo.onnx --opset 17

# Compile TensorRT engine with FP16 precision
/usr/src/tensorrt/bin/trtexec \
    --onnx=mivolo.onnx \
    --saveEngine=mivolo_fp16.engine \
    --fp16 \
    --workspace=2048 \
    --builderOptimizationLevel=5
```

TensorRT optimizes layer fusion, folds batch normalization into convolution kernels, and schedules transformer multi-head self-attention operations directly onto the Ampere Tensor Cores.

---

## 3. Multiprocessing & Zero-Copy POSIX Shared Memory

Python's Global Interpreter Lock (GIL) serializes camera frame capture, GUI rendering, and GPU inference onto a single CPU core. 

To overcome this, we split the application into three isolated OS processes:
1. **Frame Capture Process:** Reads RTSP/V4L2 hardware streams via GStreamer into `/dev/shm` (POSIX shared memory).
2. **Inference Worker:** Consumes memory-mapped NumPy arrays, runs asynchronous CUDA streams (`cudaStream_t`), and dispatches predictions.
3. **Analytics & GUI Process:** Computes smoothed demographic stats and transmits anonymized metrics via WebSockets.

Bounded FIFO queues with a **drop-oldest backpressure policy** guaranteed sub-50ms latency without unbound memory leakage.

---

## Performance Summary

| Configuration | FPS | Latency | Power Draw | Efficiency |
| :--- | :--- | :--- | :--- | :--- |
| **Workstation Dev (i7 + RTX 4070)** | 58.4 FPS | 18 ms | 280 W | 0.21 FPS/W |
| **Jetson Orin Nano (PyTorch Float32)** | 2.1 FPS | 480 ms | 12.0 W | 0.17 FPS/W |
| **Jetson Orin Nano (TensorRT FP16 Engine)** | **22.8 FPS** | **44 ms** | **14.2 W** | **1.61 FPS/W** |

The optimized edge implementation achieved a **7.6x higher energy efficiency (FPS/Watt)** than high-end desktop hardware while operating comfortably within the 15W thermal ceiling of retail kiosks.
