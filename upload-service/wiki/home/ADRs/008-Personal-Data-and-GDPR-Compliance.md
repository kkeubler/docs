---
title: '008: Personal Data and GDPR Compliance Strategy'
---

[[_TOC_]]

## Status: Proposed

## Context

To comply with the General Data Protection Regulation (GDPR) and ensure proper handling of personal data, we need a clear strategy for storing and managing user information across our microservices architecture. Personal data (names, email addresses, contact details, etc.) must be dummy data. A distributed approach where multiple services store real personal data would create significant compliance risks, increase the attack surface, and complicate data subject request fulfillment.

## Decision

We will centralize all personal data storage in a dedicated User Service and employ pseudonymization across all other services.

- **Personal data must be dummy data**
- **Personal data will be exclusively held in the User Service**: All identifiable information about users (name, email, address, phone number, etc.) will be stored only in the User Service's database.
- **Other services will use pseudo IDs**: All other microservices will reference users exclusively through pseudonymous identifiers (pseudo IDs) that cannot be directly linked to a person without access to the User Service mapping.
- **REST endpoints for data retrieval**: Services requiring personal data for specific operations (e.g., sending emails, displaying user profiles) must request this information through well-defined REST endpoints provided by the User Service.
- **Pseudo IDs are not considered sensitive data**: Pseudo IDs may be freely stored, logged, and cached in service-specific databases, as they do not reveal personal information without access to the User Service mapping.
- **Data minimization principle**: Services should only request the minimal personal data fields necessary for their specific use case.

## Consequences

### Positive

- **GDPR compliance**: Centralized personal data storage significantly simplifies compliance with data subject rights (access, erasure, portability).
- **Reduced attack surface**: Personal data exposure is limited to a single service, reducing the impact of potential data breaches in other services.
- **Clear data ownership**: The User Service has unambiguous responsibility for personal data protection and lifecycle management.
- **Simplified auditing**: Data access patterns and personal data flows can be monitored and audited at the User Service boundary.
- **Easier data retention policies**: Data retention and deletion policies can be implemented consistently in one location.

### Negative

- **Increased latency**: Services may experience additional network overhead when retrieving personal data through REST endpoints.
- **Single point of failure**: The User Service becomes critical for operations requiring personal data; unavailability impacts dependent services.
- **Additional API calls**: Operations requiring personal data will need extra service-to-service communication.
- **Development overhead**: Teams must design their services to work with pseudo IDs and implement proper data retrieval patterns.
- **Caching complexity**: Services that need frequent access to personal data must implement appropriate caching strategies while respecting data freshness and access control requirements.