---
title: 'Proxmox Homelab'
subtitle: 'Multi-Node Virtualization, Zero-Trust Mesh & Automated Incident Response'
description: 'Multi-node virtualization cluster built with Proxmox VE 9.2, unprivileged LXCs, automated ZFS snapshots, Tailscale mesh networking, and integrated Wazuh SIEM / Shuffle SOAR automation.'
category: 'Homelab / DevOps'
tags: ['Proxmox', 'Docker', 'Tailscale']
image: '/assets/project_proxmox.jpg'
github: 'https://github.com/808THRONE/homelab-infra'
featured: true
metrics: ['Multi-node virtualization', 'Zero-trust VPN mesh', 'Automated SOAR incident response']
order: 2
---

## Project Overview

This multi-node homelab infrastructure serves as a production-grade playground for edge networking, virtualization security, and automated threat response. Built on **Proxmox Virtual Environment (VE) 9.2**, the cluster hosts mission-critical self-hosted services, developer staging environments, container orchestration engines, and a complete cybersecurity operations center (SOC).

Rather than treating the homelab as a collection of ad-hoc virtual machines, the environment is engineered around enterprise discipline: strict VLAN network segmentation, zero-trust mesh ingress via WireGuard/Tailscale, immutable ZFS snapshot replication, and automated security orchestration with Wazuh SIEM and Shuffle SOAR.

---

## Infrastructure Architecture

```
                                  [ WAN / Remote Clients ]
                                             |
                                  (Tailscale WireGuard Mesh)
                                  [ Zero Open Inbound Ports ]
                                             |
                                             v
                           +-----------------------------------+
                           |        pfSense / OPNsense         |
                           |   Firewall & Inter-VLAN Gateway   |
                           +-----------------+-----------------+
                                             |
                   +-------------------------+-------------------------+
                   |                         |                         |
                   v                         v                         v
            [ VLAN 10 - MGMT ]       [ VLAN 20 - APPS ]       [ VLAN 30 - DMZ ]
          Proxmox Node 1 & 2       Docker Swarm / LXCs       Traefik Reverse Proxy
          Managed Switches / PDU   Database Clusters         Public Ingress Gate
                   |                         |                         |
                   +-------------------------+-------------------------+
                                             |
                                             v
                                   [ VLAN 50 - SEC OPS ]
                                   Wazuh Manager & Indexer
                                   Shuffle SOAR Engine
                                   Prometheus & Grafana
```

---

## Key Architectural Components

### 1. High-Performance ZFS Storage Fabric
Storage reliability and data integrity are handled natively by ZFS:
* **Mirrored NVMe & SAS Pools:** Operating systems and latency-sensitive VM disks run on mirrored NVMe pools configured with `ashift=12` and tuned `recordsize` allocations (16 KB for PostgreSQL / SQLite, 128 KB for general container root filesystems).
* **Automated Snapshot Lifecycle:** Implemented `sanoid` for automated policy-based snapshot scheduling (hourly for 48 hours, daily for 30 days, monthly for 6 months) combined with `syncoid` for off-site encrypted replication.
* **Transparent Compression:** Enabled `zstd` compression across all storage pools, achieving a 1.45x global storage efficiency ratio with negligible CPU overhead.

### 2. Network Segmentation & VLAN Topology
Network traffic is isolated using Proxmox Linux VLAN-aware bridges (`vmbr0`) and managed IEEE 802.1Q trunk lines:
* **VLAN 10 (Management Plane):** Dedicated to Proxmox VE web GUI (port 8006), IPMI/iDRAC out-of-band management, and managed switch control planes. Strictly isolated from all general workloads.
* **VLAN 20 (Internal Workloads):** Dedicated to unprivileged LXC containers, internal Redis caches, private API endpoints, and internal databases.
* **VLAN 30 (DMZ & Ingress):** Houses Traefik reverse proxy and Cloudflare edge connectors. Can only communicate with internal application ports via explicit firewall state rules.
* **VLAN 50 (Security Operations):** Dedicated to SIEM log ingestion, Elasticsearch/Indexer nodes, and SOAR execution runners.

### 3. Zero-Trust Mesh Networking (Tailscale)
All remote administrative access is governed by an authenticated **Tailscale** overlay network powered by WireGuard:
* **Zero Port-Forwarding:** WAN router firewalls drop all inbound connection attempts; no ports are exposed to the public internet.
* **Subnet Routers & ACL Enforcement:** High-availability Tailscale subnet routers expose management VLANs exclusively to authorized administrative devices possessing valid hardware security keys (FIDO2/WebAuthn).
* **Exit Nodes & Split DNS:** Mesh nodes utilize homelab internal recursive DNS resolvers for seamless resolution of internal domain names.

### 4. Container Orchestration & Ingress (Traefik + Docker)
* **Unprivileged LXC Deployment:** Service workloads run inside lightweight unprivileged Linux Containers (LXC) with user namespace remapping (UID 100000+), preventing privilege escalation to the host hypervisor.
* **Traefik Reverse Proxy:** Automatically discovers container services via Docker socket proxies, managing routing rules, path-based load balancing, and rate limiting.
* **Automated ACME TLS:** Uses Cloudflare DNS-01 API challenges to automatically generate and renew wildcard Let's Encrypt SSL/TLS certificates (`*.lab.internal`) without opening HTTP port 80.

---

## Security Automation & SOAR Incident Response

```
 [ Syslog / Auditd Logs ] 
            │
            ▼
    [ Wazuh Agent ] ──(Encrypted Agent Channel)──► [ Wazuh SIEM Manager ]
                                                           │
                                             Alert Trigger (Rule Severity >= 10)
                                                           │
                                                           ▼
                                                [ Shuffle SOAR Webhook ]
                                                           │
                                        ┌──────────────────┴──────────────────┐
                                        ▼                                     ▼
                                [ Automated Action ]                 [ Encrypted Alert ]
                           - Quarantine LXC Container               Telegram Notification &
                           - Push IP to CrowdSec / pfSense           Incident Ticket Generated
```

1. **Host-Level Telemetry:** Every Proxmox node and LXC container runs an unprivileged Wazuh agent performing continuous file integrity monitoring (FIM), rootkit detection, and audit log analysis.
2. **Detection & Correlation:** Wazuh Manager correlates security events against the MITRE ATT&CK framework.
3. **Automated Containment with Shuffle:** High-severity triggers (e.g., repeated SSH brute-force attempts, unauthorized privilege changes, or abnormal outbound network scans) invoke custom Shuffle SOAR playbooks:
   * Dynamically injects offending IP addresses into firewall blocklists.
   * Isolates the target container’s virtual network interface via Proxmox API calls.
   * Transmits encrypted incident alerts with forensic metadata directly to a dedicated administrative channel.

---

## Key Achievements & Impact

* **High Service Availability:** 99.9% uptime maintained across virtualization nodes with zero data loss during scheduled rolling kernel upgrades.
* **Automated Recovery:** Infrastructure configurations and container volumes backed up daily with Proxmox Backup Server (PBS) featuring client-side encryption and deduplication.
* **Zero Attack Surface:** Eliminated all external public attack surfaces while delivering instant remote access across devices worldwide.
