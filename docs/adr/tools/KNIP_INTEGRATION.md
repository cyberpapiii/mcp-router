# Architecture Decision Record: Knip Integration for Dead Code Detection

## Status

Accepted

## Context

MCP Router is a monorepo project with multiple workspaces. As the codebase grows, the following challenges have become apparent:

- Accumulation of unused code, dependencies, and exports
- Increased build times and bloated bundle sizes due to unnecessary dependencies
- Increased maintenance costs
- Difficulty for new developers to understand the codebase

To address these challenges, we need a mechanism to automatically detect dead code and keep the codebase clean.

## Decision

We adopt [Knip](https://knip.dev/) to automate dead code detection across the entire monorepo.

### Rationale

1. **TypeScript/JavaScript Specialized**: Optimized for TypeScript projects, enabling accurate analysis using type information
2. **Monorepo Support**: Supports per-workspace analysis and configuration
3. **Comprehensive Detection**: Centralized detection of unused files, dependencies, and exports
4. **CI/CD Integration**: Easy to incorporate into automation pipelines
5. **Turbo Compatible**: Enables fast analysis leveraging caching

## Consequences

### Positive

1. **Improved Code Quality**
   - Automatic detection of unused code keeps the codebase clean
   - Regular analysis prevents accumulation of technical debt

2. **Improved Build Performance**
   - Reduced build times by removing unnecessary dependencies
   - Optimized distribution size through reduced bundle size

3. **Improved Developer Experience**
   - Improved codebase readability
   - Easier onboarding for new developers

4. **Cost Reduction Through Automation**
   - Eliminates manual dead code detection work
   - Automatic checks in CI/CD pipeline

### Negative

1. **Initial Configuration Complexity**
   - Configuration required for each workspace
   - Handling false positives (adjusting ignore settings)

2. **Build Pipeline Overhead**
   - Additional execution time for analysis processing
   - (Can be mitigated with Turbo cache)
## Implementation

### Architecture

```
┌─────────────────────────────────────────────────┐
│                  Turbo Pipeline                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │  Build  │→ │  Knip   │→ │  Test   │         │
│  └─────────┘  └─────────┘  └─────────┘         │
└─────────────────────────────────────────────────┘
       ↓              ↓              ↓
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Workspace 1 │ │ Workspace 2 │ │ Workspace N │
│   (apps/)   │ │ (packages/) │ │    (...)    │
└─────────────┘ └─────────────┘ └─────────────┘
```

### Debugging and Troubleshooting

```bash
# Run with debug information
pnpm knip --debug

# Show configuration hints
pnpm knip --include-config-hints

# Dry run
pnpm turbo knip --dry-run
```

### Performance Optimization

1. **Leverage Turbo Cache**: Always run with `pnpm turbo knip`
2. **Workspace Filtering**: Analyze specific workspaces only with `--filter`
3. **Parallel Execution**: Parallel analysis of multiple workspaces via Turbo
4. **Input Configuration**: Optimize file patterns for change detection

### Operational Guidelines

1. **Regular Execution**
   - During development: Check as needed with `pnpm knip`
   - On PR: Automatic check via CI
   - Weekly: Full scan and report generation

2. **Handling False Positives**
   - Update ignore patterns in `knip.json` as needed
   - Utilize workspace-specific configurations

3. **Incremental Improvement**
   - Remove existing dead code gradually
   - Zero tolerance for new code

## Alternatives Considered

1. **ESLint no-unused-vars**
   - Limitation: Cannot detect unused at file level
   - Limitation: Cannot analyze dependencies

2. **ts-prune**
   - Limitation: Only targets TypeScript exports
   - Limitation: Limited monorepo support

3. **Manual Checking**
   - Problem: Not scalable
   - Problem: Risk of human error

## References

- [Knip Documentation](https://knip.dev/)
- [Turbo Documentation](https://turbo.build/)
