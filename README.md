# LangChain Agents — Learning Lab

> **Learning lab.** Five small TypeScript scripts I wrote while learning LangChain's agent APIs. They are exercises, not a product. My portfolio work is pinned on my [profile](https://github.com/aastha0208).

## What LangChain is

LangChain is an open-source framework for building applications on top of large language models. Instead of writing raw API calls, you assemble an application from standard building blocks:

- **Models** behind one common interface, so you can switch between providers (Anthropic, OpenAI and others) without rewriting the app
- **Tools**: functions the model can decide to call, such as looking up an order, searching documents or calling an internal API
- **Agents**: a loop where the model reasons, chooses a tool, reads the result and decides what to do next, until it can answer
- **Memory**: conversation state that persists across turns (provided by LangGraph, LangChain's lower-level orchestration library)
- **Middleware**: hooks that run around each model or tool call, used for policies such as model routing, guardrails or human approval

The value is speed and portability: common patterns come pre-built, and the app isn't locked to one model provider.

## What I built

Each script adds one concept to the same toy weather agent, so the differences are easy to compare. The tools return stubbed data; the point is the agent mechanics.

| Script | Concept | What I learned |
|---|---|---|
| `agent1.ts` | A basic agent with one tool | The model decides *whether* to call a tool from its name, description and input schema. Tool descriptions are effectively instructions to the model. |
| `agent2.ts` | Runtime context | Information about the caller, such as a `user_id`, is passed in at call time rather than baked into the prompt. That's how one agent serves many users safely. |
| `agent3.ts` | System prompt, structured output, model settings | A system prompt sets behaviour and tone; a response schema makes the output predictable; temperature, token limits and timeouts are product settings, not just technical ones. |
| `agent4.ts` | Memory per conversation | History is stored per `thread_id`. Reusing one thread ID for two different users mixes their memories, a privacy bug that comes from a design decision, not a coding error. |
| `agent5.ts` | Middleware for model routing | A middleware layer picks a cheaper model for short conversations and a stronger one once a conversation passes three messages. Cost and quality become a policy you can tune. |

## Applying it in products

How I'd use these building blocks when shaping an AI feature:

1. **Start from the job, not the framework.** Define the task the agent does and what a good answer looks like before choosing tools or models.
2. **Treat each tool as a permission.** Every tool expands what the model can reach. Give it the narrowest access that does the job, which is the same least-privilege thinking I used in identity security.
3. **Design memory deliberately.** Decide what is remembered, for how long, and for whom. Scope it per user and per session, as `agent4.ts` showed the hard way.
4. **Make model choice a policy.** Route simple requests to cheaper, faster models and hard ones to stronger models, and measure whether the routing actually holds quality.
5. **Require structured output wherever results feed something else.** It's what makes an agent's answers checkable, and the foundation for the evaluation work in [prompt-eval-gate](https://github.com/aastha0208/prompt-eval-gate).
6. **Put risky actions behind a person.** Anything that writes, sends or spends should pause for human approval, which middleware makes straightforward.

## Where LangChain fits best

- **Support and service assistants** that answer questions and act through tools: order status, account lookups, ticket creation
- **Internal knowledge assistants** that search company documents and answer with sources (retrieval-augmented generation)
- **Workflow agents** that coordinate several internal APIs to complete a multi-step task
- **Multi-model products** that need to route between providers for cost, speed or resilience
- **Fast prototyping**, to test whether an agent idea works before investing in custom infrastructure

## Where I'd be cautious

- **A single prompt-and-response feature** doesn't need an agent framework. A direct SDK call is simpler to build, test and debug.
- **Strict, predictable workflows** with fixed steps are often better as ordinary code that calls a model at specific points, rather than an agent choosing its own path.
- **Abstraction can hide what the model actually sees.** When quality matters, you need tracing and evaluation to see the real prompts and tool calls.
- **The ecosystem moves fast.** APIs change between versions, so pin dependencies and budget time for upgrades.

## Running it

```bash
npm install
cp .env.example .env   # then add your own keys
npx tsx agent1.ts
```

`agent5.ts` uses both Anthropic and OpenAI models, so it needs both keys.
