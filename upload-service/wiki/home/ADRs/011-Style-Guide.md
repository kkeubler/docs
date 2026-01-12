---
title: '011: Code & UI Style Guide'
---
## Status: Accepted

## **Context**

Our web learning platform is built using a **microservice architecture**, with each service developed independently.\
That means that every team is developing frontends and backends in **different programming languages and frameworks**, depending on their service’s requirements and team preferences.

While this supports flexibility, individual skillsets and experimentation, it also increases the risk of:

* Inconsistent code quality and documentation.
* (Divergent development workflows and testing approaches.)
* Reduced maintainability and onboarding friction.

At the same time, our frontend services require a shared **visual and stylistic consistency** to deliver a cohesive user experience across the platform.

To balance autonomy and consistency we proposes two coordinated measures:

1. A **lightweight, language-agnostic style guide** covering general coding and collaboration practices for all contributors.
2. A **shared design-token system** to unify styling across all frontend services.

---

## **Decision**

We will establish two related but distinct resources:

### 1. **Unified Coding Style Guide (Cross-Team)**

A single, **framework- and language-agnostic** style guide will be created as a _living document_ in the repository.\
It will define **baseline engineering practices** applicable to all teams, regardless of their chosen technology stack.

The guide will focus on:

* **Code readability and naming principles** (consistent, descriptive identifiers)
* **Documentation expectations** (docstrings, README structure)
* **Testing practices** (unit testing encouraged, clear coverage expectations)
* **Code review standards** (peer review, constructive feedback)
* **Accessibility and usability awareness** (especially for UIs)
* **Security and data handling awareness** (input validation, secrets management)

It will _not_ dictate framework-specific details (e.g., React component patterns, Node.js conventions, language specific style rules, etc.).\
Individual service teams remain responsible for defining any **language-specific guidelines** within their subdirectories if desired.

The document will live under `/style-guide/` and evolve collaboratively through pull requests.

### 2. **Unified UI Design System**

To ensure a consistent visual experience across all microfrontends, we introduce a shared UI design system with the following components:

1. Use the shadcn/ui ([Setup Guide](https://ui.shadcn.com/docs/installation/vite)) component library
2. Use tailwind for css styling (already installed with shadcn/ui)
3. Use the [shadcn/ui MCP Server](https://ui.shadcn.com/docs/mcp) to help the AI generating shadcn/ui components for microfrontends
4. Adopt a global shadcn/ui theme provided and maintained by the Dashboard-Service Team
5. Avoid defining custom CSS variables, as they may break styling consistency across microfrontends

This system will serve as the **single source of truth** for design values, aligning all frontends under one unified visual language.

The detailed setup guide will be placed in the [Frontend Setup Guide](home/microfrontend-setup) in this wiki.

---

## **Consequences**

### **Positive**

* Promotes consistent collaboration and professional engineering habits across all teams, regardless of tech stack.
* Improved code readability and maintainability
* Ensures **visual coherence** across micro-frontends through shared design tokens.
* Balances autonomy and governance — teams can choose frameworks but still follow common principles.

### **Neutral**

* The guide remains intentionally high-level; it won’t enforce style rules for specific languages.
* Each team may still have to define their own detailed framework or language conventions.

### **Negative**

* Risk of partial adoption if not maintained — mitigated by assigning review ownership and encouraging continuous updates.
* Initial time investment to create and align on shared principles as well as defining and maintaining the Style Guide