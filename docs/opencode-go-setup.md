# OpenCode-Go Integration Setup Guide

## Overview
This fork adds support for **OpenCode-Go** LLM provider with multiple model endpoints:
- **GLM-5.1** (via OpenAI-compatible endpoint)
- **MiniMax M2.7** (via OpenAI-compatible endpoint)
- **Qwen 3.6+** (via OpenAI-compatible endpoint)

Also configured: **DeepSeek V4** (deepseek-chat, deepseek-reasoner)

## Prerequisites
- Node.js >= 18.0.0
- pnpm (package manager)
- Claude Code CLI installed (`npm install -g @anthropic-ai/claude-code`)
- API keys for:
  - OpenCode-Go: `sk-...` (get from https://opencode.ai)
  - DeepSeek: `sk-...` (get from https://api.deepseek.com)

## Installation & Setup

### 1. Clone the Fork
```bash
git clone git@github.com:gogonuk/claude-code-router-1.git
cd claude-code-router-1
pnpm install
pnpm build
```

### 2. Configure API Keys
Create `.env` file (secure, chmod 600):
```bash
mkdir -p ~/.claude-code-router
cat > ~/.claude-code-router/.env << 'EOF'
# OpenCode-Go API Key
OPENCODE_API_KEY=sk-your-opencode-key-here

# DeepSeek API Key  
DEEPSEEK_API_KEY=sk-your-deepseek-key-here
EOF
chmod 600 ~/.claude-code-router/.env
```

### 3. Global Configuration
Create `~/.claude-code-router/config.json`:
```json
{
  "APIKEY": "your-secret-key-here",
  "PORT": 3456,
  "Providers": [
    {
      "name": "opencode",
      "api_base_url": "https://opencode.ai/zen/go/v1/chat/completions",
      "api_key": "sk-your-opencode-key-here",
      "models": ["glm-5.1", "qwen3.6-plus", "minimax-m2.7"]
    },
    {
      "name": "deepseek",
      "api_base_url": "https://api.deepseek.com/v1/chat/completions",
      "api_key": "sk-your-deepseek-key-here",
      "models": ["deepseek-chat", "deepseek-reasoner"]
    }
  ],
  "Router": {
    "default": "opencode,glm-5.1",
    "think": "opencode,minimax-m2.7",
    "fast": "deepseek,deepseek-chat"
  }
}
```

**⚠️ Important Config Notes:**
- Use `api_base_url` (with underscore), NOT `base_url`
- Use `Providers` (capital P) array format, NOT `providers` object
- Use `api_key` (with underscore), NOT `apiKey`
- All OpenCode-Go models use `/v1/chat/completions` endpoint (OpenAI-compatible)
- Avoid `/v1/messages` endpoint for OpenCode-Go (has auth issues)

### 4. Project-Specific Configuration (Optional)
For per-project config, create:
```bash
# Replace /home/gogo/dev_projects/your-project with your project path
mkdir -p ~/.claude/projects/-home-gogo-dev-projects-your-project
cat > ~/.claude/projects/-home-gogo-dev-projects-your-project/claude-code-router.json << 'EOF'
{
  "Providers": [
    {
      "name": "opencode",
      "api_base_url": "https://opencode.ai/zen/go/v1/chat/completions",
      "api_key": "sk-your-opencode-key-here",
      "models": ["glm-5.1", "minimax-m2.7"]
    }
  ],
  "Router": {
    "default": "opencode,glm-5.1"
  }
}
EOF
```

## Starting the Server

### Method 1: Using the CLI
```bash
cd /path/to/claude-code-router-1
./dist/cli.js start
```

### Method 2: Background Process
```bash
cd /path/to/claude-code-router-1
nohup ./dist/cli.js start > /tmp/ccr.log 2>&1 &
sleep 3
curl http://127.0.0.1:3456/health
# Should return: {"status":"ok","timestamp":"..."}
```

## Testing the Integration

### 1. Health Check
```bash
curl http://127.0.0.1:3456/health
```

### 2. Test GLM-5.1
```bash
curl -X POST http://127.0.0.1:3456/v1/messages \
  -H "x-api-key: your-secret-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "opencode,glm-5.1",
    "max_tokens": 50,
    "messages": [{"role": "user", "content": "Say hello in 5 words"}]
  }'
```

### 3. Test MiniMax M2.7
```bash
curl -X POST http://127.0.0.1:3456/v1/messages \
  -H "x-api-key: your-secret-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "opencode,minimax-m2.7",
    "max_tokens": 50,
    "messages": [{"role": "user", "content": "Say hello in 5 words"}]
  }'
```

### 4. Test DeepSeek V4
```bash
curl -X POST http://127.0.0.1:3456/v1/messages \
  -H "x-api-key: your-secret-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek,deepseek-chat",
    "max_tokens": 50,
    "messages": [{"role": "user", "content": "Say hello in 5 words"}]
  }'
```

## Connecting Claude Code CLI

Set environment variables to route Claude Code through CCR:
```bash
export ANTHROPIC_API_KEY="your-secret-key-here"
export ANTHROPIC_BASE_URL="http://127.0.0.1:3456"
claude
```

Or use the built-in activation:
```bash
eval "$(./dist/cli.js activate)"
claude
```

## Log Locations
- Server logs: `~/.claude-code-router/logs/ccr-*.log`
- Application logs: `~/.claude-code-router/claude-code-router.log`
- Check logs for provider registration:
  ```bash
  grep "provider registered" ~/.claude-code-router/logs/ccr-*.log | tail -10
  ```

## Troubleshooting

### Server Won't Start
```bash
# Check if port is in use
lsof -i :3456

# Kill existing processes
pkill -f "cli.js"

# Check logs
cat ~/.claude-code-router/logs/ccr-*.log | tail -50
```

### "Provider not found" Error
- Ensure config uses `Providers` (capital P) array
- Check provider names match in config and API calls
- Verify providers are registered in logs

### API Key Issues
- OpenCode-Go uses `Authorization: Bearer <key>` header
- DeepSeek uses `Authorization: Bearer <key>` header
- CCR passes API key from config to provider requests
- Check logs for "final request" to see actual headers sent

### Environment Variable Interpolation Not Working
**Known Issue**: `${VAR_NAME}` interpolation in config.json doesn't work in compiled code.
**Workaround**: Store API keys directly in config.json (less secure but functional).

To debug interpolation:
```bash
# Check if env vars are loaded
cd /path/to/claude-code-router-1
node -e "console.log('DEEPSEEK_API_KEY:', process.env.DEEPSEEK_API_KEY ? 'set' : 'not set')"
```

## Project Structure
```
claude-code-router-1/
├── packages/
│   ├── cli/          # CLI tool (ccr command)
│   ├── server/       # Core server (API routing)
│   ├── shared/       # Shared utilities
│   └── ui/          # Web management interface
├── dist/
│   └── cli.js        # Compiled CLI (main executable)
├── docs/             # Documentation
└── goals.md          # Project goals and progress
```

## Key Files for Debugging
- `packages/server/src/index.ts` - Server initialization, provider setup
- `packages/server/src/utils/index.ts` - Config parsing, env var interpolation
- `@musistudio/llms` - External package handling transformers and routing
- `~/.claude-code-router/config.json` - Global configuration
- `~/.claude/projects/*/claude-code-router.json` - Per-project config

## Next Steps for Developers
1. Fix env var interpolation in compiled code (see `packages/server/src/utils/index.ts`)
2. Add native support for `/v1/messages` endpoint with proper auth header (`x-api-key`)
3. Test with actual Claude Code CLI interactive sessions
4. Add OpenRouter integration (deferred)
5. Document performance benchmarks for each model

## Useful Commands
```bash
# Rebuild after changes
pnpm build

# Run in dev mode (ts-node, auto-reload)
pnpm dev:server

# Check provider registration
curl http://127.0.0.1:3456/api/transformers

# Stop server
./dist/cli.js stop

# Restart server
./dist/cli.js restart

# Check server status
./dist/cli.js status
```
