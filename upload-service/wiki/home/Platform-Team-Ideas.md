# GitLab Best Practices for Large Monorepo Teams

A comprehensive guide for platform teams managing 20+ developers in a monorepo environment.

---

## Table of Contents

1. [Code & Commit Quality Controls](#code--commit-quality-controls)
   - [Push Rules](#push-rules)
   - [Code Owners](#code-owners)
   - [Merge Request Approval Rules](#merge-request-approval-rules)
   - [Protected Branches](#protected-branches)
   - [Commit Linting in CI](#commit-linting-in-ci)
2. [CI/CD and Automation](#cicd-and-automation)
   - [GitLab CI/CD Pipelines](#gitlab-cicd-pipelines)
   - [Pipeline Templates](#pipeline-templates)
   - [Merge Trains](#merge-trains)
   - [Review Apps](#review-apps)
   - [Environment Management](#environment-management)
3. [Monorepo Structure Support](#monorepo-structure-support)
   - [Path-based CI](#path-based-ci)
   - [Child Pipelines](#child-pipelines)
   - [GitLab Caching & Artifacts](#gitlab-caching--artifacts)
4. [Compliance & Governance](#compliance--governance)
   - [Audit Events](#audit-events)
   - [Compliance Pipelines](#compliance-pipelines)
   - [Security Scanning](#security-scanning)
5. [Collaboration & Developer Experience](#collaboration--developer-experience)
   - [GitLab Issue Boards & Epics](#gitlab-issue-boards--epics)
   - [GitLab Discussions](#gitlab-discussions)
   - [GitLab Templates](#gitlab-templates)
6. [Practical Setup Blueprint](#practical-setup-blueprint)

---

## Code & Commit Quality Controls

### Push Rules

Configure Push Rules at the repository or group level to enforce commit standards:

- Require commit messages to match a **regex pattern** (e.g., Conventional Commits)
- Reject commits without a **signed GPG key**
- Reject pushes with **secrets** or large files
- Prevent force-pushes to protected branches
- Enforce branch naming conventions
- Block specific file types or patterns

**Example regex for conventional commits:**
```
^(feat|fix|docs|style|refactor|perf|test|chore)(\([a-z0-9-]+\))?: .{1,100}$
```

> **Note:** Push Rules are a Premium/Ultimate feature.

---

### Code Owners

GitLab's **CODEOWNERS** file allows you to:

- Define who must approve changes in specific directories or files
- Automatically request reviews from owners on merge requests
- Route reviews automatically to appropriate teams
- Integrate with approval rules for enforcement

**Best Practice:** Use this to enforce ownership over key subsystems (e.g., `/frontend`, `/backend`, `/infra`). Platform teams should own CI/CD configuration changes.

---

### Merge Request Approval Rules

Critical for teams with 20+ developers. You can:

- Require a **minimum number of approvers** before merging
- Designate specific approvers (like Platform Team members)
- Require code owner approvals for specific paths
- Combine with CODEOWNERS for automatic enforcement
- Block merges if discussions aren't resolved

**Example:** Require 2 approvals for backend changes, 1 for documentation.

---

### Protected Branches

Essential for workflow control. Protected branches allow you to:

- Restrict who can push/merge to main branches
- Require merge requests for all changes
- Require approvals before merging
- Prevent force pushes to maintain commit history integrity
- Set different rules for different branches (e.g., stricter rules for production)
- Combine with approval rules for additional safety

---

### Commit Linting in CI

Even if developers bypass push rules via CLI, run a **commit lint job** in your pipeline to fail merge requests with invalid commit messages.

**Tooling example:**
- Use [commitlint](https://github.com/conventional-changelog/commitlint) + [husky](https://typicode.github.io/husky/) in your monorepo root

---

## CI/CD and Automation

### GitLab CI/CD Pipelines

Create modular pipelines with:

- **Dynamic Child Pipelines** (useful for monorepos)
- **Include** configuration to share common templates across projects
- **Rules/changes** to trigger only affected jobs

**Example - Run frontend jobs only if frontend files change:**
```yaml
rules:
  changes:
    - "frontend/**/*"
```

**Pipeline Rules & Policies:**
- Require pipelines to pass before merging
- Set up security scanning, linting, test coverage requirements
- Create compliance pipelines that run on all projects

---

### Pipeline Templates

Maintain `.gitlab-ci-templates/` in your monorepo or a central infra repo:

- Shared jobs for linting, testing, building, etc.
- Reusable YAML templates imported via `include:`
- Ensures consistency across the organization

---

### Merge Trains

**Premium feature** - Excellent for busy teams:

- Automatically queue and merge MRs sequentially after successful pipelines
- Prevents race conditions and broken `main` branches
- Tests MRs against the target branch plus queued changes
- Huge time-saver for repositories with high merge frequency

---

### Review Apps

Deploy **temporary environments** per merge request:

- Perfect for QA/UX review
- Auto-destroyed when MR is closed or merged
- Enables visual verification before merging

---

### Environment Management

Use **environments** and **deployments** features for:

- Staging, QA, and Production deployments
- Track what version is deployed where
- Rollback directly from GitLab UI

---

## Monorepo Structure Support

### Path-based CI

Configure **rules:changes** to run jobs selectively for changed paths (frontend/backend, etc.). Critical for monorepo performance with many developers - only runs jobs when relevant files change.

---

### Child Pipelines

Split your monorepo CI into multiple smaller pipelines for each module. This keeps pipelines fast and modular.

**Example:**
```yaml
include:
  - local: .gitlab-ci/frontend.yml
  - local: .gitlab-ci/backend.yml
```

---

### GitLab Caching & Artifacts

- Cache dependencies (e.g., `node_modules`, `pip` cache) efficiently across modules
- Use artifacts to share built outputs between jobs
- Optimizes pipeline performance in large monorepos

---

## Compliance & Governance

### Audit Events

Audit logs track:

- Pushes
- Merge approvals
- Pipeline triggers

Useful for compliance and debugging.

---

### Compliance Pipelines

**GitLab Ultimate feature** - Define organization-wide compliance pipelines that always run, regardless of project configuration. Great for:

- Security scanning
- License scanning
- Separation of duties
- Enterprise-grade controls

---

### Security Scanning

Use built-in security features:

- **SAST** (Static Application Security Testing)
- **DAST** (Dynamic Application Security Testing)
- **Dependency Scanning**
- **Container Scanning**

They integrate seamlessly into your CI/CD pipelines.

---

## Collaboration & Developer Experience

### GitLab Issue Boards & Epics

Organize work across teams visually:

- **Epics** → Group related issues across projects
- **Boards** → Kanban-style workflow per team/module

---

### GitLab Discussions

Encourage **threaded code discussions** in merge requests:

- Easier to track and resolve than Slack or external comments
- **Required Discussions Resolution** ensures all threads are resolved before merging
- Prevents premature merges and missed feedback

---

### GitLab Templates

Use templates for consistency:

- **Merge request templates** - Standardizes process with checklists and required information
- **Issue templates** (e.g., "bug", "feature request")
- **CI job templates** - Reusable pipeline configurations

---

## Practical Setup Blueprint

### Recommended Monorepo Structure

```
.monorepo/
├── .gitlab-ci.yml
├── .gitlab-ci/
│   ├── frontend.yml
│   ├── backend.yml
│   └── lint.yml
├── CODEOWNERS
├── commitlint.config.js
└── apps/
    ├── frontend/
    ├── backend/
    ├── shared/
```

### Minimum Configuration for Teams of 20+

For a team your size, implement these core features:

1. ✅ **Protected main/develop branches** with required approvals (at least 2)
2. ✅ **CODEOWNERS file** with Platform Team owning CI/CD configs
3. ✅ **Push rules:** Conventional commits required (if Premium/Ultimate)
4. ✅ **MR approval rules:** Require 2 reviewers minimum
5. ✅ **Merge request template** with commit message standards
6. ✅ **Require pipeline success** before merging
7. ✅ **CI/CD:** Monorepo-aware, modular pipelines using path-based rules
8. ✅ **Squash commits:** Set to "Require" or "Encourage" for clean history
9. ✅ **Merge trains:** Safe, sequential merging (if Premium)
10. ✅ **Review apps:** Preview per MR
11. ✅ **Templates:** Standardized MRs, issues, jobs

### Merge Strategy Options

- **Squash commits** - Keeps history clean, can be required at project level
- **Fast-forward merge** - Maintains completely linear history without merge commits

---

## Key Takeaway

The combination of **protected branches**, **approval rules**, and **CODEOWNERS** gives you strong control without micromanaging every merge request - crucial at scale. This setup provides discipline, maintains quality, and enables efficient scaling of your development process.