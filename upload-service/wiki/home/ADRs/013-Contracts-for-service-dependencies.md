[[_TOC_]]

## Status
Accepted

## Context
In our architecture, multiple services depend on each other to fulfill end-to-end features.  
Communicating requirements for service dependencies or new feature requests informally (via tickets, chats, or ad hoc docs).  
Can lead to:
- Ambiguity about what is expected of a service provider.
- Misalignment between frontend, backend, and integration teams.
- Missing or incomplete information about preconditions, postconditions, invariants, and error handling.
- Difficulty verifying if a feature has been implemented according to expectations.

To improve clarity and alignment, we need a standardized way to capture and agree on service dependencies and feature requirements **before implementation starts**.  
The chosen approach is to use a **Service Contract Template** that explicitly defines:
- Business-level description of the feature/service operation.
- Preconditions (what must be true before execution) – consumer obligations.
- Postconditions (guarantees after execution) – provider commitments.
- Invariants (rules that always hold) – integrity guarantees.
- Error handling scenarios and agreed response codes.
- An implementer’s proposal (often an OpenAPI specification) to finalize exact interface details.

This serves both as:
- A functional agreement between teams.
- A documentation artifact for QA, onboarding, compliance, and change management.

## Decision
We will use the **Service Contract Template** for all new service dependencies and feature requests that cross service boundaries.  

**Key points:**
1. **Mandatory Template** – Any request to another service must be documented in the template format before work begins.
2. **Two-section approach**:
   - Business contract definition (pre/post/invariant/error handling).
   - Implementer’s proposal (API spec, mock events, payload schemas).
3. **Versioned in repo/wiki** – Contracts are stored alongside code (e.g., `/docs/contracts/`) or in the Architecture Wiki, with change history.
4. **Contract Ownership** – The requesting team owns the business definition; the providing team owns the implementation proposal.  
5. **Sign-off required** – Both sides must approve before development starts.
6. **ADR Linkage** – Each Service Contract is linked to an ADR that records the decision to proceed.
7. Ping the reciving team on matrix

Benefits:
- Removes ambiguity in service-to-service dependencies.
- Ensures non-functional requirements (performance, limits, error codes) are agreed early.
- Helps QA align test cases directly with contract expectations.
- Reduces rework by surfacing integration gaps upfront.

## Consequences
**Positive:**
- Clear and consistent communication of requirements across teams.
- Reduced integration bugs due to explicit shared understanding.
- Faster onboarding for new developers by reading contracts.
- Contracts become living documentation for future reference.

**Negative / Trade-offs:**
- Slightly increased upfront effort before development.
- Requires discipline to keep contracts updated with changes.
- Risk of “document drift” if teams fail to maintain contract artifacts.