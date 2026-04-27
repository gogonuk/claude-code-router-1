# Claude Code Router - Fork Goals & Progress

## Goal
- Set up claude-code-router fork to connect Claude Code to DeepSeek V4 and opencode-go LLM providers with per-project config and secure API key storage.

## Constraints & Preferences
- Use forked repo, not direct clone of musistudio/claude-code-router
- Per-project config (`~/.claude/projects/...`), not global
- API keys in `/home/gogo/.claude-code-router/.env` (chmod 600), not `~/.zshrc`
- Integration priority: DeepSeek → opencode-go → OpenRouter (deferred)
- opencode-go requires mixed endpoints (Anthropic `/v1/messages` for MiniMax, OpenAI `/v1/chat/completions` for others)

## Progress
### ✅ Done
- Forked `musistudio/claude-code-router` → `gogonuk/claude-code-router-1`
- Cloned to `/home/gogo/dev_projects/claude-code-router-1`, built all packages
- DeepSeek V4 configured and working (`deepseek-chat` for flash, `deepseek-reasoner` for pro)
- opencode-go configured and working with dual endpoints:
  - `opencode,glm-5.1` - GLM-5.1 via OpenAI endpoint ✅
  - `opencode,minimax-m2.7` - MiniMax M2.7 via OpenAI endpoint ✅
  - `opencode,qwen3.6-plus` - Qwen 3.6+ via OpenAI endpoint ✅
- Created per-project config at `~/.claude/projects/-home-gogo-dev-projects-claude-code-router-1/claude-code-router.json`
- Created global config at `~/.claude-code-router/config.json`
- Stored API keys directly in config (env var interpolation not working in compiled code)
- Updated `~/.zshrc` to source `.env` file
- Health check works: `curl http://127.0.0.1:3456/health` returns `HTTP 200`
- API tests passed:
  - `curl -X POST http://127.0.0.1:3456/v1/messages -H "x-api-key: test-secret-key" -d '{"model":"opencode,glm-5.1",...}'` ✅
  - `curl -X POST http://127.0.0.1:3456/v1/messages -H "x-api-key: test-secret-key" -d '{"model":"opencode,minimax-m2.7",...}'` ✅
  - `curl -X POST http://127.0.0.1:3456/v1/messages -H "x-api-key: test-secret-key" -d '{"model":"deepseek,deepseek-chat",...}'` ✅
- **Documentation added to `docs/`:**
  - `opencode-go-setup.md` - Complete setup guide for OpenCode-Go integration ✅
  - `troubleshooting.md` - Common issues and solutions ✅
  - `configuration-reference.md` - Complete config options reference ✅
  - `command-reference.md` - All commands for terminal and Claude Code CLI ✅

### ⚠️ Known Issues
- `${DEEPSEEK_API_KEY}` env var interpolation in config NOT working (compiled code issue)
- Workaround: Store API keys directly in config.json (less secure but functional)
- MiniMax Anthropic endpoint (`/v1/messages`) returns 401 - use OpenAI endpoint instead

### 📝 Next Steps
- Commit and push fork changes to `gogonuk/claude-code-router-1`
- Test with actual Claude Code CLI
- Document opencode-go integration in README
- Fix env var interpolation in compiled code (optional)

## Key Decisions
- Use direct API keys in config instead of env var interpolation (temporary workaround)
- Use OpenAI-compatible endpoints for all opencode-go models (avoid Anthropic endpoint auth issues)
- DeepSeek API key: `sk-abbc8bca41214dfabd10e7aaf35c14dd`
- opencode-go API key: `sk-1v1X4kUKCLHZgsQ8ux3sFztbydEd4WK9CRE0RaKOdLJ18EKe4lfn1vceiudfwIRa`
- Router config: default→GLM-5.1, think→MiniMax-M2.7, fast→DeepSeek-V4

## Critical Context
- Server port: 3456, starts with `cd /home/gogo/dev_projects/claude-code-router-1 && ./dist/cli.js start`
- Health endpoint: `curl http://127.0.0.1:3456/health` → `{"status":"ok","timestamp":"..."}`
- API endpoint: `POST http://127.0.0.1:3456/v1/messages` with `x-api-key` header
- Config format: Use `Providers` array with `api_base_url` (not `base_url`) and `api_key` (not `apiKey`)

## Relevant Files
- `/home/gogo/dev_projects/claude-code-router-1` - Forked repo (built, dist/cli.js exists)
- `~/.claude-code-router/config.json` - Global config with Providers array ✅
- `~/.claude-code-router/.env` - API keys (chmod 600, sourced by ~/.zshrc)
- `~/.claude/projects/-home-gogo-dev-projects-claude-code-router-1/claude-code-router.json` - Project config
- `/home/gogo/.zshrc` - Shell config (lines 323-368: CCR setup, sources .env)
- `/home/gogo/dev_projects/claude-code-router-1/goals.md` - Project goals (updated with progress)
- `packages/server/src/index.ts` - Server code checking `config.Providers` array
- `packages/server/src/utils/index.ts` - Contains `interpolateEnvVars()` function (not working in dist)
