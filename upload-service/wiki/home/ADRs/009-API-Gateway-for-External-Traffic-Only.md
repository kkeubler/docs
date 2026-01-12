---
title: '009: API Gateway for External Traffic Only'
---

[[_TOC_]]

## Status: Accepted

## Context

In our microservices architecture, we need to define clear boundaries between external client traffic and internal service-to-service communication. An API Gateway provides centralized authentication, authorization, rate limiting, and routing for external requests. However, routing all traffic—including internal service communication—through the API Gateway introduces unnecessary latency, creates a potential bottleneck, and increases architectural complexity. We need a clear policy on when the API Gateway must be used and when direct service communication is appropriate.

## Decision

The API Gateway will be used exclusively for traffic originating from outside the cluster. Internal service-to-service communication will bypass the API Gateway.

- **External traffic MUST use the API Gateway**: All requests from clients outside the Kubernetes cluster (web applications, mobile apps, third-party integrations) must be routed through the API Gateway.
- **Internal traffic bypasses the API Gateway**: Services within the cluster will communicate directly with each other using internal service endpoints (e.g., Kubernetes service DNS).
- **Authentication guarantee**: Every request that passes through the API Gateway can be considered authenticated (for protected resources) or validated as legitimate (for public resources).
- **API Gateway responsibilities**: The API Gateway handles authentication, authorization, rate limiting, request validation, and routing for external traffic.
- **Internal communication patterns**: Services communicate internally using REST APIs (see [ADR 001](home/ADRs/001-Client-facing-APIs)) or other appropriate protocols, without additional gateway overhead.

## Consequences

### Positive
- **Reduced latency for internal calls**: Direct service-to-service communication eliminates unnecessary network hops through the gateway.
- **Simplified failure scenarios**: Internal communication is not dependent on API Gateway availability.
- **Better performance**: Reduced load on the API Gateway allows it to focus on external traffic handling.
- **Clear security boundary**: The API Gateway serves as the single entry point for external traffic, simplifying security auditing and access control.
- **Authentication trust**: Services can trust that requests originating from the API Gateway have been properly authenticated and validated.
- **Scalability**: Internal services can scale independently without being bottlenecked by gateway capacity.

### Negative
- **Dual communication patterns**: Developers must understand when to use the API Gateway (external) versus direct service calls (internal).
- **Internal authentication required**: Services must implement their own internal authentication mechanisms (e.g., service accounts, mutual TLS) for service-to-service security, if needed.
- **Potential for inconsistent policies**: Rate limiting and validation logic may need to be duplicated if internal services require similar protections.
- **Observability complexity**: Request tracing across internal services requires distributed tracing solutions rather than centralized gateway logging.
- **Network policy dependency**: Kubernetes network policies or service mesh configurations must be properly configured to secure internal communication.