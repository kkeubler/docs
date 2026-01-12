---
title: '010: Pseudo ID Injection via Custom Header'
---

[[_TOC_]]

## Status: Accepted

## Context

As defined in [ADR 008](home/ADRs/008-Personal-Data-and-GDPR-Compliance), services use pseudo IDs to reference users instead of storing personal data directly. The API Gateway, after authenticating external requests (see [ADR 009](home/ADRs/009-API-Gateway-for-External-Traffic-Only)), must provide a mechanism to convey the authenticated user's pseudo ID to downstream services. A standardized approach is needed to ensure all services can reliably identify which user initiated a request without exposing personal information or relying on token parsing.

## Decision

The API Gateway will inject the authenticated user's pseudo ID into all authenticated requests using a custom HTTP header named `X-User-Pseudo-ID`.

- **Header name**: `X-User-Pseudo-ID`
- **Value**: The pseudonymous identifier for the authenticated user (e.g., UUID v4 format)
- **Injection point**: The API Gateway adds this header immediately after successful authentication, before routing to backend services
- **Header propagation**: Services making internal calls to other services (bypassing the API Gateway per [ADR 009](home/ADRs/009-API-Gateway-for-External-Traffic-Only)) MUST propagate this header in downstream requests to maintain user context
- **Public endpoints**: For unauthenticated/public endpoints, this header will not be present
- **Header protection**: The API Gateway MUST strip any `X-User-Pseudo-ID` header from incoming external requests to prevent header spoofing
- **Service trust**: Services can trust that any request containing this header originated from the API Gateway and represents an authenticated user

## Consequences

### Positive
- **Standardized user identification**: All services use a consistent mechanism to identify the requesting user
- **Simplified service logic**: Services don't need to parse authentication tokens or maintain complex session management
- **Clear security boundary**: The API Gateway is solely responsible for mapping authenticated users to pseudo IDs
- **GDPR alignment**: Reinforces pseudonymization strategy from [ADR 008](home/ADRs/008-Personal-Data-and-GDPR-Compliance)
- **Audit trail**: The pseudo ID can be logged throughout the request chain without exposing personal data
- **Flexibility**: Changing the underlying authentication mechanism doesn't require changes to downstream services

### Negative
- **Header propagation responsibility**: Developers must remember to propagate the header in internal service calls, or user context will be lost
- **Potential for errors**: If a service forgets to propagate the header, downstream services may operate without user context, potentially causing authorization failures or incorrect behavior
- **No built-in validation**: Services must trust the header value without independent verification (mitigated by network policies and API Gateway header stripping)
- **Debugging complexity**: Tracing issues related to missing or incorrect pseudo IDs requires checking the entire request chain
- **Convention dependency**: Relies on developer discipline rather than technical enforcement for header propagation