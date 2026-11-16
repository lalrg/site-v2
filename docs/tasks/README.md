# Tasks

One file per ticket set. Filename: `<TICKET-ID>-<slug>.md` (e.g.
`SITE-12-add-blog-index.md`). A ticket is only buildable if it carries:

- **Type** — feat | fix | chore | docs | test | refactor
- **Size** — S | M | L (larger than M → split it)
- **Context** — link to the spec in `../specs/`
- **Acceptance criteria** — observable, checkable at a named route
- **Verification** — the exact command(s) that prove it (`yarn lint`,
  `yarn build`, plus the route to open)

Ticket template: `~/.config/opencode/templates/tasks.md`.
