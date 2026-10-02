# Ornith-1.5 Audit — Vendrith Inspiration

Status: Reference / inspiration only. Ornith-1.5 is not installed as a Vendrith runtime dependency.

## What Ornith-1.5 demonstrates

Ornith-1.5 extends self-scaffolding toward a self-improvement loop for agentic tasks. The published description centers on task generation, task-specific scaffold construction, solution rollouts, and reinforcement learning.

The official project describes the family as self-improving open-source models for agentic tasks, with 9B dense, 35B MoE, and 397B MoE variants.

## What Vendrith should adapt

Vendrith should borrow the workflow idea, not the model-training stack:

Task Generator -> Strategy/Scaffold Candidate -> Agent Run -> Verification -> Evaluation -> Improvement Proposal -> Approval -> Project Memory

Adapt:
1. Generate bounded engineering tasks from project gaps, failed checks, regressions, or manual requests.
2. Generate candidate strategies/tool workflows rather than letting the model directly rewrite source.
3. Run candidates through repository, CodeGraph, Asset Registry, and verification tools.
4. Record validity, verification outcome, novelty, and difficulty/frontier evidence.
5. Persist proposals and outcomes as project memory.

## Vendrith safety boundary

- AI proposes; Vendrith policy decides.
- Tools execute only through explicit access controls.
- Verification establishes what actually happened.
- Mutation requires an approved execution path.
- The model cannot self-approve its own mutation.
- Licensing-sensitive asset changes remain subject to Asset Registry policy.
- Production deployment, destructive history changes, secrets, and other high-risk actions remain separately gated.

## Architecture mapping

| Ornith concept | Vendrith adaptation |
|---|---|
| Generated training task | Project improvement task |
| Task-specific scaffold | Agent strategy/tool plan |
| Solution rollout | Tool-loop agent run |
| Reward/evaluation signal | Verification + evaluation record |
| Self-improvement | Improvement proposal/history |
| RL training | Deferred; not part of V1 |
| Model-weight update | Deferred; never triggered by the editor |

## V1 boundary

Build typed improvement records, deterministic orchestration, explicit verification, approval-gated proposals, and append-only improvement history.

Defer reinforcement-learning training, model-weight updates, autonomous source mutation, autonomous dependency installation, autonomous asset downloading, and unrestricted long-running agents.

## Sources

- Official Ornith-1.5 announcement: ornith.ai/blog/ornith-1-5
- Official repository: github.com/ornith-ai/Ornith-1
- Model registry reference: ollama.com/library/ornith-1.5

The exact training and serving implementation may evolve; Vendrith should depend on stable interfaces and verification contracts rather than Ornith-specific internals.
