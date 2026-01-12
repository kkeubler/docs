---
title: '006: Team Communication Platform'
---

[[_TOC_]]

## Status

Accepted

## Context

Our learning platform development involves a lot of developers working in a monorepo structure across multiple teams. Effective communication and coordination between teams is critical for:

- **Knowledge sharing**: Teams need to share technical decisions, architectural changes, and best practices that affect the entire codebase
- **Dependency coordination**: With a monorepo, changes in one team's area can impact other teams' work
- **Async collaboration**: Developers work across different schedules and time zones, requiring persistent, searchable communication
- **Team autonomy**: Each team needs dedicated spaces for internal discussions while maintaining visibility across the organization
- **Onboarding**: New developers need a clear communication structure to understand team boundaries and find the right people

Current challenges include:
- Fragmented communication across email, direct messages, and ad-hoc channels
- Difficulty discovering ongoing discussions relevant to cross-team concerns
- Lack of structured spaces for both team-specific and organization-wide communication
- No centralized, searchable archive of technical discussions and decisions

We need a communication platform that balances team autonomy with organization-wide transparency, is self-hosted or institutionally hosted for data sovereignty, and provides modern chat capabilities suitable for technical teams.

## Decision

We will adopt the [**Hochschule der Medien (HdM) hosted Matrix Element Server**](https://matrix.mi.hdm-stuttgart.de/) as our primary team communication platform.

### Structure

**Root Space: StudyfAI**
- General room for organization-wide announcements and discussions
- Cross-team topics, architectural decisions, and platform-wide initiatives
- All team members are members of this space

**Team Sub-Spaces**
- Each development team gets a dedicated sub-space within the root space
- Teams have autonomy to create their own channels as needed (e.g., #daily-standup, #code-reviews, #tech-discussions)
- Team-specific technical discussions, sprint planning, and internal coordination happen here

### Naming Conventions

- Root space: `StudyfAI`
- General room: `#general`
- Team sub-spaces: `[Team Name]` (e.g., `Frontend`)
- Team channels: Teams define their own, but we recommend prefixes like `#team-general`, `#team-tech`

### Guidelines

- Use threads for detailed technical discussions to keep channels organized
- Important decisions and outcomes should be documented in ADRs or wiki pages, with links shared in relevant channels
- @mentions and room notifications should be used judiciously
- Teams are encouraged to make relevant channels visible to other teams for transparency

## Consequences

### Positive

- **Self-hosted by institution**: HdM-hosted infrastructure ensures data sovereignty and compliance with educational institution policies
- **Hierarchical organization**: Space and sub-space structure provides clear organizational boundaries while maintaining connectivity
- **Team autonomy**: Teams can organize their internal communication structure according to their needs
- **Discoverability**: Central space makes it easy to discover teams and find relevant discussions
- **Searchability**: Matrix/Element provides full-text search across all accessible rooms
- **Modern features**: Rich text formatting, code blocks, file sharing, integrations, and threading support
- **Open standard**: Matrix is an open protocol, avoiding vendor lock-in
- **Cross-platform**: Available on web, desktop (Windows, macOS, Linux), and mobile (iOS, Android)
- **Persistent history**: All communication is archived and searchable for future reference

### Negative

- **Learning curve**: Team members unfamiliar with Matrix/Element will need onboarding
- **Space management overhead**: Requires designated space administrators to manage permissions and structure
- **Potential for fragmentation**: Without discipline, important discussions might get siloed in team sub-spaces
- **Limited institutional control**: Dependent on HdM's hosting, maintenance, and uptime policies
- **Notification management**: With multiple spaces and channels, developers need to configure notifications carefully to avoid overload

### Risks and Mitigations

- **Risk**: Over-communication or notification fatigue
  - **Mitigation**: Establish notification etiquette guidelines; encourage use of threads; recommend configuring notification preferences per room
  
- **Risk**: Important decisions get lost in chat
  - **Mitigation**: Mandate that significant decisions are documented in ADRs or documentation, with chat serving as discussion forum
  
- **Risk**: HdM server downtime affecting productivity
  - **Mitigation**: Establish fallback communication channels (email distribution lists) for critical announcements; maintain documentation outside of Matrix