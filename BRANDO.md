# Brando-AS Customizations

This fork of `RF-D/motion-mcp` adds a Brando-specific layer on top of the upstream Motion API tools. Everything Brando-specific lives under the `motion_brando_*` namespace, so the upstream `motion_*` tools continue to work unchanged.

## What's added

- **Team registry** — aliases `stener`, `theo`, `vegard` map to Brando emails. Use them anywhere an assignee is expected.
- **Name-based resolution** — pass workspace/project names ("Shopify Core") instead of IDs. Resolved at call time and cached for the process lifetime.
- **Linear cross-linking** — `BRA-XXX` mentions in titles/descriptions are auto-detected and rendered as a Linear deep-link block in the Motion task description.
- **Brando defaults** — primary developer is Stener; default priority is `MEDIUM`; auto-scheduling is on by default with a `SOFT` deadline on `Work Hours`.

## Tools

| Tool | What it does |
|------|--------------|
| `motion_brando_team` | List the Brando team registry. |
| `motion_brando_resolve` | Resolve a workspace/project/assignee name to a Motion ID. |
| `motion_brando_create_task` | Create a task using names ("Shopify Core", "Theo") with auto BRA-XXX linking. |
| `motion_brando_link_linear` | Append a `BRA-XXX` reference to an existing Motion task. |
| `motion_brando_my_tasks` | Stener's tasks across workspaces, with optional filters. |
| `motion_brando_team_tasks` | Tasks assigned to any team alias. |
| `motion_brando_refresh_cache` | Drop the in-memory resolver cache. |

## Setup

```bash
npm install
npm run build
cp .env.example .env  # set MOTION_API_KEY
```

### Claude Code (per-user)

Append to `~/.claude/settings.json` under `mcpServers`:

```json
{
  "mcpServers": {
    "brando-motion": {
      "command": "node",
      "args": ["/Users/stenernorkovtorstensen/Projects/motion-mcp/dist/index.js"],
      "env": {
        "MOTION_API_KEY": "<your-motion-api-key>",
        "MOTION_RATE_LIMIT_PER_MINUTE": "120"
      }
    }
  }
}
```

### Claude Desktop

Append to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "brando-motion": {
      "command": "node",
      "args": ["/Users/stenernorkovtorstensen/Projects/motion-mcp/dist/index.js"],
      "env": {
        "MOTION_API_KEY": "<your-motion-api-key>",
        "MOTION_RATE_LIMIT_PER_MINUTE": "120"
      }
    }
  }
}
```

Restart Claude Desktop after editing.

## Updating from upstream

The fork keeps `RF-D/motion-mcp` as the `upstream` remote. To pull changes:

```bash
git fetch upstream
git merge upstream/main
npm run typecheck && npm run build
```

Brando customizations live entirely in `src/brando/` and `src/tools/brando.ts`, plus a small `index.ts` registration line — merges should rarely conflict.

## Adding a team member

Edit `src/brando/team.ts` and add to `BRANDO_TEAM`. No other changes needed; resolvers pick it up automatically.
