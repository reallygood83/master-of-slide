# Theme references (demo-derived)

These files describe **demo-derived themes** — palettes, typography, layout rhythm, and motion philosophy distilled from `apps/demo/slides/` so the `/slide` workflow can apply them in any workspace, even when those demo slides are not present.

| Theme id              | Style                          | Source slide                                            |
| --------------------- | ------------------------------ | ------------------------------------------------------- |
| `neo-brutalism`       | bold borders, hard shadows     | `gpt-image-2-prompt-cheatsheet`, `open-slide-launch`    |
| `research-brief`      | light academic, serif display  | `llm-fundamentals`, `ssh-explained`                     |
| `vercel-minimal`      | white deck, system diagrams    | `nextjs-ppr-cache`                                      |
| `raycast-dark-product`| dark SaaS, UI panels, halo     | `raycast-api`                                           |
| `photo-editorial-tech`| photo-driven Korean magazine   | `harness-engineering-ko`                                |

Together with the three official themes in `../themes/` (`editorial-noir`, `paper-press`, `neon-terminal`) and the `auto` choice, the `/slide` skill exposes **9 theme options** to the user.

When applying a theme, the slide skill reads:

1. The user's workspace `themes/<id>.md` if present.
2. Otherwise the bundled file under `../themes/<id>.md` (official) or `./<id>.md` (demo-derived).

This guarantees that decks generated from a fresh `pnpm install:agents` install — without `apps/demo` available — still land on the correct visual style.
