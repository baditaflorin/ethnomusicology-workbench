# 0007 - Data Generation Pipeline

## Status

Accepted

## Context

Mode B would require build-time data generation. This project is Mode A.

## Decision

Do not create a data-generation backend in v1. Synthetic demo recordings are generated in-browser for smoke testing and demos.

## Consequences

`make data` is intentionally absent. Reproducibility focuses on source builds and deterministic analysis functions.

## Alternatives Considered

A committed sample corpus was rejected because field recordings require explicit licensing and cultural context.
