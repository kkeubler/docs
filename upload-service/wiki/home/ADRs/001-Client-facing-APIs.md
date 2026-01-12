---
title: '001: Adoption of REST for All Client-Facing APIs'
---

[[_TOC_]]

## Status: Accepted

## Context

Our system requires a standardized approach for exposing functionality to client applications, including web, mobile, and third-party integrations. Currently, services use mixed interface patterns (GraphQL, gRPC, REST), which increases complexity in client development, documentation, and maintenance. A unified approach is needed to ensure consistent client communication, better compatibility with HTTP infrastructure, and simpler onboarding for developers.

## Decision

All client-facing APIs must be implemented using REST principles.
- Each service that directly interfaces with external clients will expose a RESTful API, using standard HTTP methods (GET, POST, PUT, DELETE, PATCH) and status codes.
- JSON will be the default data exchange format.

## Consequences:
- Improved interoperability with existing HTTP tools, caching, and load balancers.
- Easier documentation and developer onboarding through shared REST guidelines and tooling (see [ADR 002](home/ADRs/002-REST-API-Documentation)).
