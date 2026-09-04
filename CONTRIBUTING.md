# Contributing

Thank you for helping improve MeshOps.

## Local checks

Before opening a pull request:

```bash
npm ci
npm test
bash scripts/validate-services.sh
bash scripts/validate-mesh.sh
```

If Docker is available, also start the Compose environment and call `/api/checkout`.

## Pull requests

- Keep each change within one roadmap milestone.
- Include tests or an explanation of why no test applies.
- Update the changelog when behavior changes.
- Preserve request-ID forwarding and the `/health` contract.
- Preserve strict mTLS and the documented authorization graph.
- Record architecture changes as an ADR.

## Commit style

Use a short imperative subject, such as `Add inventory readiness probe`.
