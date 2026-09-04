# Zero Trust and Chaos

MeshOps v0.9.0 combines adversarial trust probes with bounded chaos exercises. The browser presents seven scenarios and nine defensive controls. Operators must contain the probe with the smallest justified policy set; missing controls increase blast radius, while unnecessary controls reduce the trust score.

## Zero-trust layers

- Strict mTLS rejects plaintext service traffic.
- SPIFFE workload identity authenticates service principals.
- AuthorizationPolicy enforces the documented call graph.
- RequestAuthentication validates JWT issuer, audience, signature, and roles.
- A namespace Sidecar restricts service discovery and egress.
- Kubernetes NetworkPolicy adds default-deny segmentation beneath the mesh.

The demo JWT key is intentionally non-production and has no distributed signing credential. Replace it with an organizational identity provider before adapting the policy.

## Safety-gated chaos

The repository includes bounded Chaos Mesh profiles for a 30-second payment delay, one orders pod termination, and 60 seconds of search CPU stress. They are never installed or run automatically. The script requires Chaos Mesh CRDs, a namespace labeled `meshops.dev/environment=training`, the explicit `meshops.dev/allow-chaos=true` annotation, and a final `--confirm` argument.

Run chaos only in a disposable lab cluster. `clear-chaos` removes active experiments. `apply-zero-trust` and `clear-zero-trust` manage the opt-in security policies independently.
