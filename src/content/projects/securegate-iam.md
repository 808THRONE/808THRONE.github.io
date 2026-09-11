---
title: 'SecureGate IAM Portal'
subtitle: 'Zero-Trust Identity and Access Management Progressive Web Application'
description: 'High-security Progressive Web Application prototype featuring RFC-compliant OAuth 2.1 PKCE authorization, TOTP two-factor lifecycle management, ABAC policy builder, and encrypted client storage.'
category: 'Cybersecurity / Web'
tags: ['OAuth 2.1', 'TypeScript', 'WebSockets']
image: '/assets/project_prototype.jpg'
github: 'https://github.com/808THRONE/securegate-iam'
featured: true
metrics: ['PKCE client authorization', 'TOTP security verification', 'Encrypted IndexedDB & CSP audit logs']
order: 3
---

## Project Overview

**SecureGate IAM Portal** is a security-first Progressive Web Application (PWA) prototype engineered to demonstrate zero-trust client architecture for enterprise identity and access management. Traditional web frontends frequently suffer from insecure token storage patterns, vulnerability to Cross-Site Scripting (XSS), and lack of real-time administrative visibility.

SecureGate demonstrates how modern browser APIs—such as the **Web Cryptography API**, **Content Security Policy (CSP) Level 3**, **Subresource Integrity (SRI)**, and persistent **WebSockets**—can be combined with modern identity standards to create an intrusion-resistant administration client.

---

## Key Capabilities & Security Architecture

```
                    +-------------------------------------+
                    |       Browser Client (React/TS)     |
                    +------------------+------------------+
                                       |
           +---------------------------+---------------------------+
           |                                                       |
           v                                                       v
+-----------------------+                               +-----------------------+
|  OAuth 2.1 PKCE Engine|                               |  In-Memory Token Box  |
|  - Web Crypto SHA-256 |                               |  - Ephemeral Access   |
|  - Cryptographic Salt |                               |  - No LocalStorage    |
+-----------+-----------+                               +-----------+-----------+
            |                                                       |
            +---------------------------+---------------------------+
                                        |
                                        v
                       +---------------------------------+
                       |  Web Cryptography API (AES-GCM) |
                       |  Encrypted Local IndexedDB      |
                       +----------------+----------------+
                                        |
                                        v
                       +---------------------------------+
                       |   Authenticated WebSocket Link  |
                       |   Real-Time SOC Audit Streaming |
                       +---------------------------------+
```

---

## Core Security Features

### 1. OAuth 2.1 Authorization Code Flow with PKCE
SecureGate strictly follows the latest OAuth 2.1 draft guidelines designed to eliminate implicit grants and insecure client authorization patterns:
* **Cryptographic Proof Key:** Generates a high-entropy cryptographically random `code_verifier` (43 to 128 characters) using `window.crypto.getRandomValues()`.
* **SHA-256 Challenge Generation:** Derives the `code_challenge` via `crypto.subtle.digest('SHA-256')` with URL-safe base64 encoding.
* **Interception Protection:** Verifies authentication responses at the token endpoint, neutralizing authorization code interception attacks even in environments lacking strict client secrets.

### 2. In-Memory Ephemeral Token Store & Encrypted IndexedDB
* **Defense Against Token Theft:** Access tokens are stored exclusively in volatile memory variables scoped within an isolated service module. Tokens are never exposed to `localStorage` or `sessionStorage`, rendering trivial XSS scraping attempts ineffective.
* **AES-GCM Client-Side Encryption:** Non-sensitive offline configuration data and session cache stored in browser IndexedDB are encrypted using AES-256-GCM via the Web Cryptography API, utilizing ephemeral encryption keys derived through PBKDF2.

### 3. Multi-Factor Authentication (RFC 6238 TOTP)
* **Lifecycle Management:** Complete user onboarding workflow for Time-based One-Time Password (TOTP) authenticators (Google Authenticator, Bitwarden, 1Password).
* **Cryptographic Verification:** Generates standard Base32 secret keys, renders RFC-compliant `otpauth://` visual QR codes directly as sanitized SVGs, and performs client-side verification test checks with window drift tolerance.
* **Emergency Recovery System:** Produces cryptographically hashed single-use backup recovery codes formatted for secure user export.

### 4. Attribute-Based Access Control (ABAC) Engine
* **Dynamic Policy Evaluation:** Interactive visual rule builder enabling security operators to create complex access policies based on:
  * **Subject Attributes:** User department, clearance level, role, group membership.
  * **Resource Attributes:** Classification level (Public, Internal, Confidential, Restricted).
  * **Environmental Attributes:** Time-of-day access windows, client IP subnet origin, device posture.
* **Deterministic Rule Resolution:** Compiles high-level policy definitions into structured JSON ASTs evaluated deterministically in sub-millisecond timeframes.

### 5. Real-Time Audit Log Streaming over WebSockets
* **Bi-directional Telemetry:** Establishes a persistent, authenticated WebSocket channel with the authentication server.
* **Security Event Streaming:** Streams live security telemetry—including failed login bursts, policy overrides, and privilege escalation requests—directly into a terminal-styled audit dashboard.
* **Fault-Tolerant Reconnection:** Implements an exponential backoff algorithm with jitter to re-establish broken socket sessions and automatically replay buffered event receipts.

---

## Defense-in-Depth Hardening Matrix

| Security Layer | Implementation Detail | Threat Mitigated |
| :--- | :--- | :--- |
| **Content Security Policy (CSP)** | `default-src 'self'; script-src 'self' 'nonce-...'` | Prevents unauthorized script injection and inline XSS execution |
| **HTML Sanitization** | Strict `DOMPurify` parsing on all dynamic strings and user inputs | Neutralizes DOM-based XSS vectors in audit views |
| **Subresource Integrity (SRI)** | Cryptographic SHA-384 hashes on all loaded external dependencies | Blocks CDN supply-chain tampering and poisoned script loads |
| **Transport Security** | Enforced HTTPS with Strict-Transport-Security (HSTS) | Eliminates man-in-the-middle (MitM) eavesdropping |
| **Input Validation** | Zod runtime schema validation for all API responses and inputs | Prevents prototype pollution and malformed payload injection |
