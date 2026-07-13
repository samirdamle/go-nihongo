<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project agent rules

See monorepo root [`../AGENTS.md`](../AGENTS.md). In particular:

1. **GitHub issue first** for every feature/fix.
2. **Create a named branch** (`issue/<n>-slug`) before implementing.
3. Never commit API keys; use `.env.example` placeholders only.

