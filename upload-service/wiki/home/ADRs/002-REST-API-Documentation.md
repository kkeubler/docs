---
title: '002: REST API Documentation'
---

[[_TOC_]]

## Status: Accepted

## Context

Our REST APIs need consistent, machine-readable documentation to improve developer experience, enable automated tooling, and ensure clarity in contract definitions. A standardized approach is required to align all REST API documentation across services.

## Decision

All REST APIs will be documented using the OpenAPI Specification (OAS) standard, version 3.0 or later.

- OAS definitions will serve as the single source of truth for API contracts.
- API documentation will be automatically generated and published as part of the CI/CD process using OpenAPI-compatible tools (e.g., Swagger UI, Redoc).
- The specification files will be version-controlled alongside the corresponding service code.
- Teams must ensure that OAS definitions accurately reflect the implemented endpoints and available operations.

## Consequences

- Consistent and standardized REST API documentation across all services.
- Enhanced automation opportunities for client SDK generation, testing, and validation.
- Easier onboarding for developers through interactive documentation interfaces.
- Additional overhead for maintaining OAS files in sync with implementation, especially for rapidly evolving APIs.
- Dependency on tooling that supports the OpenAPI ecosystem.