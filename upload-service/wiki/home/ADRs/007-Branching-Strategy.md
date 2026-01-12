---
title: '007: Trunk-Based Development with Rebase Strategy for StudyfAI'
---

[[_TOC_]]

## Status

Accepted

## Context

StudyfAI is a learning application built as a microservices architecture with the following characteristics:

- **Team Size**: A lot of developers working collaboratively
- **Repository Structure**: Monorepo containing multiple microservices
- **Collaboration**: Multiple teams working on different services simultaneously

### Current Challenges

With a large development team working in a monorepo, we face several challenges:

1. **Integration Complexity**: Multiple developers working on different features create integration bottlenecks when using long-lived feature branches
2. **Merge Conflicts**: Traditional merge strategies with feature branches lead to complex merge histories and difficult conflict resolution
3. **CI/CD Efficiency**: Large merge commits can make it difficult to identify issues and slow down the continuous integration pipeline
4. **Code Review Quality**: Large, stale branches accumulate too many changes, making effective code reviews difficult
5. **Deployment Coordination**: Independent microservices require clean, traceable commit history for rollback capabilities

### Alternative Approaches Considered

- **GitFlow**: Rejected due to excessive branch management overhead for 20+ developers and slower integration cycles
- **Feature Branch Workflow with Merge Commits**: Rejected due to cluttered history and merge commit noise in a monorepo
- **Direct Commits to Main**: Rejected due to lack of code review gates and quality control

## Decision

We will adopt **Trunk-Based Development with Rebase and Squash Strategy** with the following practices:

### Branching Strategy

1. **Main Branch (`main`)**: 
   - Single source of truth, always deployable
   - Protected branch requiring merge request approval
   - All microservices deploy from this branch

2. **Short-Lived Feature Branches**:
   - Naming convention: `feature/<service-name>/<ticket-id>-<brief-description>`
   - Examples: `feature/auth-service/STUDY-123-oauth-integration`
   - Maximum lifetime: 2-3 days
   - Must be regularly rebased on `main`

3. **Hotfix Branches**:
   - Naming convention: `hotfix/<service-name>/<ticket-id>-<brief-description>`
   - Created from and merged back to `main`
   - Followed by immediate deployment

### Commit and Merge Strategy

1. **Rebase Before Merge**:
   - Developers must rebase their feature branch on latest `main` before creating merge request
   - Command: `git rebase main`
   - Resolve conflicts locally before pushing

2. **Squash on Merge**:
   - All commits in a feature branch are squashed into a single commit on merge
   - Squashed commit message follows convention:
     ```
     [SERVICE-NAME] TICKET-ID: Brief description
     
     Detailed description of changes
     - Key change 1
     - Key change 2
     
     Breaking changes: (if any)
     ```

3. **Linear History**:
   - Main branch maintains a clean, linear commit history
   - No merge commits in `main` branch history
   - Each commit represents a complete, tested feature

### Merge Request Process

1. **Team-Based Reviews**:
   - Each team designates a merge coordinator (rotated weekly/bi-weekly)
   - Minimum 2 approvals required: 1 from team member, 1 from merge coordinator
   - Service-specific changes reviewed by respective service team

2. **Merge Coordinator Responsibilities**:
   - Ensure branch is rebased on latest `main`
   - Verify CI/CD pipeline passes
   - Review commit message formatting
   - Execute squash and merge
   - Monitor post-merge deployment

3. **CI/CD Gates**:
   - All automated tests must pass
   - Code coverage thresholds met
   - Static analysis checks passed
   - Service-specific integration tests successful

## Consequences

### Positive Consequences

1. **Clean History**: Linear commit history makes it easy to understand project evolution and simplifies debugging with `git bisect`

2. **Simplified Rollbacks**: Single commits per feature enable precise rollbacks without affecting unrelated changes

3. **Faster Integration**: Short-lived branches reduce integration pain and encourage continuous integration practices

4. **Better Code Reviews**: Smaller, focused merge requests improve review quality and faster feedback cycles

5. **Reduced Merge Conflicts**: Regular rebasing and short branch lifetimes minimize conflict complexity

6. **Microservice Independence**: Clear commit boundaries make it easier to track changes per service and manage independent deployments

7. **Improved CI/CD Performance**: Linear history and atomic commits speed up pipeline execution and failure identification

8. **Team Accountability**: Designated merge coordinators ensure consistency and knowledge sharing across the team

### Negative Consequences

1. **Rebase Learning Curve**: Team members unfamiliar with rebasing will need training; force-pushing can be dangerous if misused

2. **Lost Granular History**: Squashing removes individual commit history from feature branches; mitigated by detailed squash commit messages

3. **Coordinator Bottleneck**: Merge coordinators could become bottlenecks during high-activity periods; mitigated by rotation and clear escalation paths

4. **Rebase Conflicts**: Complex rebases can be intimidating for junior developers; requires pair programming support initially

5. **Coordination Overhead**: Requires discipline to keep branches short-lived and regularly rebased

### Mitigation Strategies

1. **Training Sessions**: Conduct workshops on rebase workflow, conflict resolution, and safe force-pushing
2. **Documentation**: Maintain detailed runbooks and troubleshooting guides
3. **Tooling**: Implement pre-push hooks to prevent accidental force-pushes to `main`
4. **Communication**: Use dedicated Matrix rooms for merge coordination and status updates
5. **Monitoring**: Track merge request age and notify teams when branches exceed 2-day threshold

### Success Metrics

We will evaluate this decision after 3 months based on:

- Average merge request turnaround time (target: < 4 hours)
- Merge conflict frequency (target: < 10% of MRs)
- Deployment frequency (target: multiple times per day)
- Rollback success rate (target: > 95%)
- Developer satisfaction with workflow (survey-based)