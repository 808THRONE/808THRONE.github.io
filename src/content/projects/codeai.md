---
title: 'CodeAi: Secure Developer Assistant'
subtitle: 'VS Code Assistant for Secure Software Development & Security Configurations'
description: 'AI-assisted development tooling designed to generate secure source code avoiding common vulnerabilities (CWEs), coupled with automated generation of firewall, SIEM rules, and SOAR playbooks from specifications.'
category: 'Cybersecurity / Systems'
tags: ['Python', 'Cybersecurity', 'SIEM', 'SOAR']
github: 'https://github.com/808THRONE'
featured: false
metrics: ['Automated SIEM & SOAR generation', 'CWE vulnerability avoidance', 'VS Code extension integration']
order: 4
---

## Project Overview

During my R&D engineering internship at **6NLG / Secnology** (Tunis, Tunisia), I contributed to **CodeAi**, an intelligent developer assistant integrated into VS Code with a strict focus on secure software development.

Traditional developer assistants frequently suggest vulnerable code snippets—such as unparameterized SQL queries, insecure deserialization routines, or permissive CORS headers—introducing security debt directly into production codebases.

**CodeAi** was architected to invert this dynamic by ensuring security-by-construction:
1. Assisting developers in generating code that adheres to strict secure-coding standards.
2. Automatically compiling high-level requirements into enterprise security configurations (firewalls, SIEM detection rules, and SOAR response playbooks).

---

## Technical Highlights

### 1. Secure-Code Generation & Vulnerability Mitigation
* **Fine-Tuned Language Models:** Contributed to data curation and fine-tuning of language models targeted at avoiding common vulnerability patterns (OWASP Top 10, CWE Top 25).
* **Static Rule Validation:** Integrated automated abstract syntax tree (AST) scanners to cross-validate AI code generation against security linting rules before presenting recommendations to developers.

### 2. Automated Security Operations Workflows
* **Firewall & SIEM Rule Synthesis:** Built automated pipelines translating network access requirements into vendor-agnostic firewall configurations and SIEM correlation rules.
* **SOAR Playbook Compilation:** Automated the generation of Security Orchestration, Automation, and Response (SOAR) playbooks from structured incident handling requirements, accelerating triage for security operations centers.

---

## Impact

CodeAi bridges the gap between software development and security operations, enabling engineers to write secure software by default while generating production-ready security configurations directly within their IDE.
