---
title: '016: Automated Architecture Diagram Generation'
---
[[_TOC_]]

## Status

Accepted

## Context

The application is developed by several teams, each responsible for its own services. The overall system architecture (particularly service dependencies and event flows) should remain transparent and up to date in the project README on the `main` branch.

The objective is to establish a solution that:

* aligns with team ownership and is close to development reality,
* can be automated within the existing CI/CD setup (GitLab CI),
* provides a unified standard for visualizing the architecture (Mermaid diagram).

## Decision

We adopt a decentralized-but-centrally-aggregated approach for architecture modeling and visualization:

1. **Per-service architecture source (source of truth): `interfaces.yaml`**
   * Each microservice team maintains a file named `interfaces.yaml` within its own service directory which servers as the source of truth for all interfaces and dependencies of the respective service.
   * The file describes the interfaces and dependencies using a unified and shared schema:

   ```yaml
   service:
     name: <service-name>
     label: <label>
     
     context: <context-of-service>
   
     rest-endpoints: 
       consumes: 
         <service_name>:
           - <HTTP-Method HTTP-Path>
       provides:
           - <HTTP-Method HTTP-Path>
       proposes: 
         <service_name>:
           - <HTTP-Method HTTP-Path>
   
     rabbitmq-events:
       subscribes-to: 
         <service_name>:
           - <event_name>
       publishes:
         - <event_name>
       proposes: 
         <service_name>:
           - <event_name>
   
     dom-events:
       subscribes-to: 
         <service_name>:
           - <event_name>
       publishes:
         - <event_name>
       proposes: 
         <service_name>:
           - <event_name>
   ```

   For **example**:

   ```yaml
   service:
     name: quiz-service
     label: Quiz Service
   
     context: Content Management
   
     rest-endpoints:
       consumes: 
         content-gen-service:
           - POST /api/quiz
         user-service:
           - POST /auth/validate
           - GET /users/{userId}
       provides:
         - GET /api/quiz
         - GET /api/quiz/{quizId}
         - DELETE /quiz/{id}
         - GET /api/quiz/user/{userId}/attempts
       proposes: {}
   
     rabbitmq-events:
       subscribes-to:
         achievement-service: 
           - ACHIEVEMENT_UNLOCKED
       publishes:
         - QUIZ_COMPLETED
       proposes: {}
   
     dom-events:
       subscribes-to: {}
       publishes:
         - quizCreated
         - quizSaved
       proposes: {}
   ```
   * The `name` must be:
     * lowercase
     * kebab-case
     * globally unique across the system
   * The `context` field is optional and for grouping related services under a common label inside the diagram
   * The specified interfaces under `rest-endpoints` and `events` may be empty
     * `rest-endpoints.consumes` and `events.subscribes-to`: {}
     * `rest-endpoints.provides` and `events.publishes`: \[\]
   * `rest-endpoints.proposes` / `events.proposes` specifies the proposed interfaces in regards to other services (not shown in the diagram). It is optional and may be empty ({}).
   * REST endpoints should use the following format: `<HTTP-Method> <HTTP-Path>`
   * RabbitMQ events must be written in uppercase and use underscores as separators. They should be high-level and not reflect technical details such as topics or exchanges.
   * REST endpoints and events should be defined consistently and must match on both sides of a dependency between microservices.
2. **Central architecture diagram generator**
   * A central generator script will be introduced, which:
     * collects all `interfaces.yaml` files,
     * merges them into an internal architecture model,
     * generates a Mermaid diagram,
     * updates the corresponding diagram section in the project README on `main`
3. **GitLab CI job for automatic updates**
   * A GitLab CI job will be configured to run on updates to `main`, especially when `interfaces.yaml` files change.
   * The CI job executes the generator script from above and updates the README on `main`.
4. **Responsibilities (ownership)**
   * Each microservice team is responsible for maintaining the correctness and completeness of its own `interfaces.yaml`.

## Consequences

_Positive_

* **Up-to-date architecture documentation**
  * Changes to service interfaces and dependencies are maintained directly by the responsible teams and automatically reflected in the main architecture diagram.
  * The README on `main` consistently reflects the current state of the system.
* **Strong domain ownership**
  * Teams maintain control over how their service is defined in the system architecture.
  * Documentation is located near the code, reducing friction during updates.
* **Reduced merge conflicts and coordination issues**
  * No large monolithic architecture file that causes frequent merge conflicts.
  * Teams primarily modify their own areas; aggregation happens centrally.
* **Clear standards and extensibility**
  * The shared schema and conventions enable future enhancements (e.g., databases, external APIs, interface versioning) without changing the overall approach.
  * CI validation (schema checks, dependency consistency checks) can be introduced gradually.

_Negative_

* **Maintenance overhead per team**
  * Each team must actively maintain its `interfaces.yaml`. Without discipline, documentation may drift out of sync.
  * If no validation mechanisms exist initially, inconsistencies may be introduced.
* **Dependency on shared standards**
  * Changes to the schema or naming conventions require cross-team alignment.
  * Incorrect or inconsistent `interfaces.yaml` files can temporarily break diagram generation until validation tooling is added.
* **Added CI complexity**
  * The central CI job introduces another pipeline step that may fail if misconfigured.
  * Commit strategies require careful design to avoid feedback loops (e.g., pipeline triggered by the auto-update commit).

Overall, this decision enables an automated, team-driven, and scalable architecture documentation workflow based on per-service interface definitions (`interfaces.yaml`) aggregated into a centralized Mermaid diagram through the CI pipeline.