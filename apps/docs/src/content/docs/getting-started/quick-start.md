---
title: Quick Start
description: Get up and running with Minions Workflows in minutes
---

## TypeScript

```typescript
import { createClient } from '@minions-workflows/sdk';

const client = createClient();
console.log('Version:', client.version);
```

## Python

```python
from minions_workflows import create_client

client = create_client()
print(f"Version: {client['version']}")
```

## CLI

```bash
workflows info
```
