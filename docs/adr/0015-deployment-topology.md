# 0015 - Deployment Topology

## Status

Accepted

## Context

Mode C deployment artifacts are unnecessary for a pure static site.

## Decision

Deployment topology is GitHub Pages only:

- Source: `main`
- Publish directory: `/docs`
- Live URL: https://baditaflorin.github.io/ethnomusicology-workbench/

## Consequences

No Docker Compose, nginx, Prometheus, TLS certificate management, or server runbook is needed.

## Alternatives Considered

A Docker backend was rejected for v1 because there is no runtime API.
