# Themes

Each file in this directory describes one reusable **slide theme** — palette, typography, layout, fixed Title/Footer/Eyebrow components, and motion philosophy.

Themes are **agent-facing documentation**, not runtime code. The slide author (you, or an agent) reads `themes/<id>.md` and applies it when writing `slides/<id>/index.tsx`.

## Bundled themes

This workspace ships with 8 themes plus an `auto` choice (9 total options surfaced by the `/slide` workflow):

| ID                    | Style                          |
| --------------------- | ------------------------------ |
| `editorial-noir`      | dark magazine, serif headlines |
| `paper-press`         | light printed report           |
| `neon-terminal`       | dark terminal, dev-tool feel   |
| `neo-brutalism`       | bold borders, hard shadows     |
| `research-brief`      | light academic, serif display  |
| `vercel-minimal`      | white deck, system diagrams    |
| `raycast-dark-product`| dark SaaS / API product        |
| `photo-editorial-tech`| photo-driven Korean magazine   |

`auto` is not a file — it tells the agent to inspect the document and pick the best fit, then state which theme it chose in the final output.

## Adding your own theme

Use the `create-theme` skill:

```text
"이 슬라이드를 바탕으로 새 테마를 만들어줘: slides/my-deck/index.tsx"
```

The skill will produce a single `themes/<id>.md` file describing palette, typography, layout, fixed components, and motion philosophy.
