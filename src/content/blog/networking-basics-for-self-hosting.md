---
title: 'Networking Basics for Self-Hosting & Homelabs'
description: 'A fundamental networking guide covering subnetting, CIDR math, NAT traversal, reverse proxies, and split-brain DNS for securely exposing private infrastructure.'
category: 'Cybersecurity'
pubDate: 2026-09-01
image: '/assets/blog_network.jpg'
tags: ['Networking', 'Cybersecurity', 'DNS', 'Nginx']
featured: true
readingTime: '5 min read'
author: 'Iheb Brahmi'
---

## The Mental Model of Self-Hosting

When developers begin self-hosting services, the first instinct is often: *"Forward port 443 on the router to my local PC."*

While functional, this approach exposes private operating systems to automated port scanners, shodan indexers, and credential-stuffing bots within seconds. Building resilient self-hosted infrastructure requires understanding how network protocols interact across layers 3, 4, and 7.

---

## 1. CIDR Subnetting & RFC 1918 Private Ranges

The Internet Engineering Task Force (IETF) reserved three IPv4 address blocks for private networks under **RFC 1918**:
* `10.0.0.0/8` (Class A: 16,777,216 addresses)
* `172.16.0.0/12` (Class B: 1,048,576 addresses)
* `192.168.0.0/16` (Class C: 65,536 addresses)

In a disciplined home lab, carve the `10.0.0.0/8` space into `/24` subnets (`256` addresses, `254` usable hosts):

```
Subnet: 10.10.20.0/24
Network ID:    10.10.20.0
Gateway:       10.10.20.1
Usable Range:  10.10.20.2 - 10.10.20.254
Broadcast:     10.10.20.255
Netmask:       255.255.255.0
```

---

## 2. Solving Hairpin NAT with Split-Brain DNS

If you assign `git.example.com` to your public residential IP address, accessing that domain from inside your local Wi-Fi requires your home router to perform **NAT Hairpinning** (NAT Loopback). Many consumer routers handle hairpinning poorly, resulting in connection timeouts or SSL handshake errors.

**Split-Brain DNS** solves this cleanly:
* **Public DNS (Cloudflare / Route 53):** Resolves `git.example.com` to your public IP or VPN ingress gateway.
* **Internal DNS (Pi-hole / AdGuard Home / Unbound):** Overrides `git.example.com` to resolve directly to the local LAN IP (`10.10.20.15`).

Local devices communicate directly with the local server over gigabit Ethernet speeds without ever touching the WAN gateway.

---

## 3. Reverse Proxy Architecture: Single-Point SSL Termination

Never expose individual service ports (`:8080`, `:3000`, `:9000`) directly. Instead, place an enterprise reverse proxy (**Nginx**, **Traefik**, or **Caddy**) at the network boundary.

```
Incoming Request: https://vault.808throne.me
                   │
                   ▼
       [ Nginx Reverse Proxy ]
        - TLS Termination (Let's Encrypt Wildcard Cert)
        - Security Headers (HSTS, CSP, X-Frame-Options)
        - Rate Limiting & Fail2Ban
                   │
                   ├───────────────────────┐
                   ▼                       ▼
      [ Vaultwarden (LXC) ]       [ Nextcloud (Docker) ]
         http://10.10.20.12:80       http://10.10.20.14:80
```

By concentrating TLS certificates and security policies on a single hardened proxy instance, backend applications remain strictly internal, decoupled from the internet.
