# LangChain Agents — Learning Lab

> **Learning lab.** Five small TypeScript scripts I wrote while learning LangChain's agent APIs. They are exercises, not a product. My portfolio work is pinned on my [profile](https://github.com/aastha0208).

Each script adds one concept to the same toy weather agent, so the differences are easy to compare. The tools return stubbed data; the point is the agent mechanics.

| Script | Concept |
|---|---|
| `agent1.ts` | A basic agent with a single tool |
| `agent2.ts` | Runtime context: a tool reads the `user_id` passed at call time to look up the user's location |
| `agent3.ts` | Shaping behaviour: system prompt, structured response format, and model parameters (temperature, max tokens, timeout) via `initChatModel` |
| `agent4.ts` | Memory: conversation history kept per `thread_id` with LangGraph's `MemorySaver` |
| `agent5.ts` | Middleware: dynamic model selection, using a cheaper model for short conversations and switching to a stronger one after three messages |

## What I took from it

- **Memory boundaries are a product decision.** In `agent4.ts`, reusing one `thread_id` for two different users mixes their histories. Who the agent remembers, and where that isolation boundary sits, has to be designed rather than left to defaults.
- **Model choice can be a runtime policy.** `agent5.ts` trades cost against capability per request. The same idea applies to deciding when an AI feature earns the more expensive model.
- **Structured output is what makes agents testable.** A typed response format turns free text into something you can score, which is the bridge to my evaluation work in [prompt-eval-gate](https://github.com/aastha0208/prompt-eval-gate).

## Running it

```bash
npm install
cp .env.example .env   # then add your own keys
npx tsx agent1.ts
```

`agent5.ts` uses both Anthropic and OpenAI models, so it needs both keys.
