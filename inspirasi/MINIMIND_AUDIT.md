# MiniMind — Audit Vendrith Project AI

## Source

- Name: MiniMind
- Repository: https://github.com/jingyaogong/minimind
- Author: Jingyao Gong
- Branch audited: `master`
- Audit date: 2026-10-02
- Vendrith target branch: `feat/vendrith-ecc-v1`
- Classification: LLM/runtime, tool-use, training and agent architecture reference; **not a Vendrith dependency**

## 1. Executive summary

MiniMind is an intentionally small, end-to-end LLM project implemented primarily in native PyTorch. The current repository describes a MiniMind-3 dense model around 64M parameters and a 198M-A64M MoE variant, together with tokenizer/training/inference infrastructure. It covers pretraining, SFT, LoRA, DPO, PPO/GRPO/CISPO, Tool Use, Agentic RL, adaptive thinking, distillation, and an OpenAI-compatible API server. The repository is released under Apache 2.0.

For Vendrith, the most relevant part is **not the model implementation itself**. The useful reference is the boundary between a model and an agent system:

```text
Vendrith Project AI
        |
        +-- reasoning/model provider
        |
        +-- tool router
        |
        +-- repository/code tools
        +-- CodeGraph
        +-- documentation
        +-- Asset Registry
        +-- verification
        |
        +-- approval policy
```

MiniMind demonstrates that Tool Calling and reasoning can be represented as structured messages and exposed through an OpenAI-compatible interface. This maps naturally to Vendrith's existing provider/port architecture.

## 2. Important MiniMind patterns

### 2.1 OpenAI-compatible model boundary

MiniMind provides a lightweight OpenAI-compatible API and documents support for `reasoning_content`, `tool_calls`, and `open_thinking`.

**Vendrith decision: ADAPT.**

Vendrith should define a model/provider adapter rather than coupling the AI domain to MiniMind. A future adapter could translate between the provider protocol and Vendrith's internal `AiRequest`, plan, tool-call and evidence types.

### 2.2 Tool calling as structured protocol data

MiniMind represents tool calls using structured name/arguments data and tool responses as a separate message. Its training data uses an OpenAI-style multi-turn structure and its chat template serializes tool calls as `<tool_call>` and results as `<tool_response>`.

**Vendrith decision: ADOPT the concept, ADAPT the protocol.**

Vendrith should keep tool calls typed at the application boundary. Model-specific XML/token formatting must remain inside the provider adapter. The model must never be trusted to mutate the repository directly.

Proposed conceptual flow:

```text
User request
  -> VendrithAiService
  -> plan / approval policy
  -> model provider
  -> typed tool request
  -> tool router
  -> port/adaptor
  -> tool result
  -> model provider
  -> final structured response
```

### 2.3 Multi-turn tool execution

MiniMind's Agentic RL discussion models an episode as repeated generation -> tool parsing -> tool execution -> context insertion -> generation, with termination and verification at the end.

**Vendrith decision: ADAPT later.**

This is useful for a future agent loop, but V1 should remain approval-gated and bounded. Do not introduce autonomous long-running loops merely because the model supports them.

A future loop should enforce:
- maximum tool-call/step budget;
- per-tool permission policy;
- approval for mutations;
- timeout/cancellation;
- structured tool errors;
- verification after mutations;
- audit log of each step.

### 2.4 Adaptive thinking

MiniMind moved explicit reasoning control into the chat template with `<think>` and an `open_thinking` switch rather than maintaining a separate reasoning model.

**Vendrith decision: ADAPT.**

Vendrith should treat reasoning visibility as a provider/UI concern, not as a new AI domain mode. The current Vendrith `AiMode` values remain focused on authorization/workflow semantics: `explain`, `plan`, `execute`, and `high-risk`.

Do not make raw chain-of-thought a source of truth. Vendrith should prefer concise rationale/evidence records and verification results.

### 2.5 Training data as protocol examples

MiniMind's dataset contains examples with system tools, assistant tool calls, tool results, and subsequent assistant responses.

**Vendrith decision: ADAPT.**

The pattern is valuable for designing provider evaluation fixtures. Vendrith can create small synthetic tests for:
- correct tool selection;
- valid JSON arguments;
- invalid arguments;
- tool failure;
- repeated tool calls;
- approval-required mutation;
- verification after mutation.

These fixtures should not contain secrets, private project data, or copyrighted third-party datasets unless explicitly permitted.

### 2.6 Rollout engine separation

MiniMind documents decoupling its Agentic RL rollout engine so generation backends can be switched.

**Vendrith decision: ADOPT as architecture inspiration.**

This reinforces the existing Vendrith adapter principle:

```text
AI Core
  |
  +-- ModelProviderPort
  +-- CodeIntelligencePort
  +-- RepositoryPort
  +-- DocumentationPort
  +-- AssetRegistryPort
  +-- VerificationPort
```

The model backend should be replaceable without changing the AI domain.

### 2.7 Small/local model option

MiniMind is designed to make small-model training and local inference accessible.

**Vendrith decision: DEFER as an optional provider.**

A local MiniMind provider may be useful later for offline/private development or low-cost experiments. It should not be required for the Map Editor to function.

## 3. What should NOT be copied into Vendrith

### 3.1 Do not copy the MiniMind model/training stack

Vendrith is a Next.js + TypeScript + PixiJS application. Adding PyTorch, tokenizer training, distributed training, RL training, or model checkpoints to the production web application would violate the current separation of concerns.

**Decision: N/A for production runtime.**

If experimentation is ever needed, it should live in a separate AI/model workspace or service boundary.

### 3.2 Do not make Agentic RL a V1 requirement

Agentic RL is useful research material but is substantially more complex than the current approval-gated Project AI runtime.

**Decision: DEFER.**

First establish deterministic tool execution and verification. Only then consider training or optimizing a model against Vendrith-specific environments.

### 3.3 Do not expose unrestricted model-generated tool execution

A model emitting `tool_calls` does not grant permission to execute them.

Vendrith's existing `classifyApproval` / `canMutate` policy remains authoritative. High-risk operations, repository mutation, production data, secrets, licensing-sensitive changes, and deployment must remain gated.

### 3.4 Do not expose raw reasoning as project truth

MiniMind's `<think>` mechanism is a model interaction format. It is not evidence.

Vendrith must continue to distinguish:
- verified fact;
- project rule;
- inference;
- proposal;
- unresolved conflict.

### 3.5 Do not import MiniMind datasets/assets blindly

The repository contains training data and model artifacts in addition to source code. Vendrith's asset provenance rule applies independently: repository code licensing does not automatically establish permission for every dataset, model, image, or other bundled material.

## 4. Mapping to current Vendrith implementation

| MiniMind concept | Vendrith location | Decision |
|---|---|---|
| OpenAI-compatible API | future `ModelProviderPort` adapter | ADAPT |
| Tool calls | AI tool-router boundary | ADOPT/ADAPT |
| Tool responses | typed tool-result protocol | ADOPT |
| Adaptive thinking | provider/UI option | ADAPT |
| Agent loop | future application service | DEFER |
| Rollout backend abstraction | model/provider port | ADOPT |
| Training pipeline | separate AI research workspace | DEFER |
| Local MiniMind model | optional provider | DEFER |
| Model tokenizer | provider-specific | N/A |
| RL / Agentic RL | future experimentation | DEFER |

## 5. Recommended Vendrith follow-up

The next implementation step should **not** install MiniMind.

Instead, extend the existing AI abstraction with a provider-neutral interface, for example:

```ts
export interface ModelProviderPort {
  generate(request: ModelRequest): Promise<ModelResponse>;
}
```

Keep model-specific details behind adapters:

```text
ModelProviderPort
  |
  +-- OpenAI adapter
  +-- MiniMind adapter (future)
  +-- local-model adapter (future)
```

Then add protocol-level tests before any real provider is connected.

Suggested tests:
1. plain response;
2. tool call with valid arguments;
3. malformed tool arguments;
4. multiple tool calls;
5. tool failure;
6. approval-required mutation;
7. verification failure;
8. provider timeout/cancellation.

## 6. Security and reliability implications

MiniMind's tool-use examples reinforce several Vendrith safeguards:

- tool schemas must be explicit;
- arguments must be validated before execution;
- tool results must be treated as untrusted input;
- execution permissions belong to Vendrith policy, not the model;
- tool loops need bounded budgets;
- every mutation needs verification;
- provider/model failures must not bypass approval state;
- secrets must never be inserted into model prompts by default;
- licensing-sensitive asset actions require explicit provenance evidence.

## 7. License / provenance

The MiniMind repository states that the project is released under Apache License 2.0. That applies to the repository's licensed project material according to its license notice, but Vendrith should still inspect provenance for specific datasets, model weights, generated artifacts, and third-party material before redistributing or embedding them.

For Vendrith, the safest current treatment is:

- repository architecture/code: reference under its stated Apache 2.0 terms;
- model weights: verify their exact distribution terms before redistribution;
- datasets: verify dataset-specific provenance/terms;
- third-party dependencies or upstream material: retain their separate licenses;
- no MiniMind asset/model/data becomes a Vendrith asset-registry entry merely because it appears in the repository.

## 8. Final classification

**Primary classification: ADAPT**

MiniMind is a strong reference for the **model/provider boundary, structured Tool Calling, reasoning controls, and future agent-loop design**.

It is **not** a reason to replace Vendrith's current TypeScript AI core, CodeGraph, Asset Registry, approval policy, or verification architecture.

The guiding rule remains:

> The model proposes; Vendrith policy decides; tools execute; verification establishes what actually happened.

## 9. Follow-up checklist

- [x] Research MiniMind
- [x] Audit Tool Calling
- [x] Audit reasoning/thinking boundary
- [x] Audit Agentic RL relevance
- [x] Audit provider/API boundary
- [x] Record license/provenance considerations
- [ ] Add provider-neutral `ModelProviderPort`
- [ ] Add provider protocol fixtures
- [ ] Prototype MiniMind adapter
- [ ] Evaluate local inference separately
