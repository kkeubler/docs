---
title: '005: Commit Messages'
---

# ADR: Conventional Commits Standard

[[_TOC_]]

## Status

Accepted

## Context

Our monorepo contains multiple projects and modules, with contributions from multiple teams and developers. We need a standardized approach to commit messages that:

- Provides clear context about changes without needing to read the code
- Enables automated changelog generation
- Facilitates semantic versioning
- Improves code review efficiency
- Makes git history more searchable and meaningful
- Works seamlessly with CI/CD pipelines

Currently, commit messages vary widely in format and quality, making it difficult to:
- Understand the purpose and scope of changes at a glance
- Generate automated release notes
- Track changes across different modules in the monorepo
- Identify breaking changes or important updates

## Decision

We will adopt [**Conventional Commits**](https://www.conventionalcommits.org/en/v1.0.0/) specification for all commit messages in our monorepo and enforce it using GitLab push rules.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Required Elements

**Type** (mandatory): Must be one of:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Changes to build system or dependencies
- `ci`: Changes to CI/CD configuration
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

**Scope** (optional but recommended): The module, package, or area affected
- Examples: `api`, `ui`, `auth`, `database`, `shared-utils`
- Use lowercase with hyphens
- For monorepo, scope should indicate the affected workspace/package

**Subject** (mandatory):
- Short description (max 72 characters)
- Lowercase, no period at the end
- Use imperative mood ("add" not "added" or "adds")

**Body** (optional):
- Separated by blank line from subject
- Explain the "what" and "why", not the "how"
- Wrap at 72 characters

**Footer** (optional):
- Reference issues: `Refs: #123, #456`
- Breaking changes: `BREAKING CHANGE: <description>`
- Close issues: `Closes: #123`

### Examples

Simple feature:
```
feat(auth): add OAuth2 authentication support
```

Bug fix with scope:
```
fix(api): resolve null pointer exception in user service
```

Breaking change:
```
feat(database)!: migrate to PostgreSQL 15

BREAKING CHANGE: PostgreSQL 14 is no longer supported. 
Update connection strings to use new authentication method.

Refs: #1234
```

Documentation update:
```
docs(readme): update installation instructions
```

### GitLab Push Rules Enforcement

We will configure GitLab push rules with the following regex pattern:

```regex
^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9-]+\))?!?: .{1,72}
```

This regex enforces:
- Valid type from the approved list
- Optional scope in parentheses (lowercase, alphanumeric, hyphens)
- Optional `!` for breaking changes
- Colon and space separator
- Subject line between 1-72 characters

### Configuration Steps

1. Navigate to **Settings > Repository > Push Rules** in GitLab
2. Enable "Commit message validation"
3. Add the regex pattern above
4. Add custom rejection message:
   ```
   Commit message must follow Conventional Commits format:
   <type>(<scope>): <subject>
   
   Example: feat(auth): add login feature
   See documentation: [link to ADR or guidelines]
   ```

## Consequences

### Positive

- **Automated Tooling**: Enables automated changelog generation, semantic versioning, and release notes
- **Clarity**: Developers can quickly understand the nature and scope of changes
- **Searchability**: Easy to filter commits by type or scope (`git log --grep="^feat"`)
- **Quality**: Forces developers to think about categorizing their changes
- **Consistency**: Uniform commit history across all teams and modules
- **Integration**: Better integration with project management tools through issue references
- **Monorepo Navigation**: Scope helps identify which part of the monorepo is affected

### Negative

- **Learning Curve**: Team needs training on the convention
- **Rejected Pushes**: Developers may face initial frustration with rejected commits
- **Overhead**: Writing good commit messages takes more time
- **Rebasing**: Fixing non-compliant commits in existing branches requires rebase/amend

### Recommended Tools

- **commitizen/cz-cli**: Interactive commit message creation
- **commitlint**: Local validation before push
- **standard-version**: Automated changelog and version management
- **husky**: Git hooks management for pre-commit validation