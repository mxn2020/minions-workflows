![CI](https://github.com/mxn2020/minions-workflows-workspace/actions/workflows/ci.yml/badge.svg) ![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

# minions-workflows

**Workflow definitions, step sequences, transitions, and run history**

Built on the [Minions SDK](https://github.com/mxn2020/minions).

---

## Quick Start

```bash
# TypeScript / Node.js
npm install @minions-workflows/sdk minions-sdk

# Python
pip install minions-workflows

# CLI (global)
npm install -g @minions-workflows/cli
```

---

## CLI

```bash
# Show help
workflows --help
```

---

## Python SDK

```python
from minions_workflows import create_client

client = create_client()
```

---

## Project Structure

```
minions-workflows/
  packages/
    core/           # TypeScript core library (@minions-workflows/sdk on npm)
    python/         # Python SDK (minions-workflows on PyPI)
    cli/            # CLI tool (@minions-workflows/cli on npm)
  apps/
    web/            # Playground web app
    docs/           # Astro Starlight documentation site
    blog/           # Blog
  examples/
    typescript/     # TypeScript usage examples
    python/         # Python usage examples
```

---

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Run tests
pnpm run test

# Type check
pnpm run lint
```

---

## Documentation

- Docs: [workflows.minions.help](https://workflows.minions.help)
- Blog: [workflows.minions.blog](https://workflows.minions.blog)
- App: [workflows.minions.wtf](https://workflows.minions.wtf)

---

## License

[MIT](LICENSE)
