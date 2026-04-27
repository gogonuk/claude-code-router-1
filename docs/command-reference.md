# Claude Code Router - Command Reference

## Quick Start

```bash
# 1. Start the router
cd /home/gogo/dev_projects/claude-code-router-1
./dist/cli.js start

# 2. Activate in shell
eval "$(./dist/cli.js activate)"

# 3. Run Claude Code
claude
```

---

## Commands Outside Claude Code (Terminal)

### Server Management

#### Start Server
```bash
# Standard start
cd /home/gogo/dev_projects/claude-code-router-1
./dist/cli.js start

# Background process with logging
nohup ./dist/cli.js start > /tmp/ccr.log 2>&1 &

# With environment variables exported
export DEEPSEEK_API_KEY="sk-..."
export OPENCODE_API_KEY="sk-..."
./dist/cli.js start
```

#### Stop Server
```bash
./dist/cli.js stop
# Or manually:
pkill -f "cli.js"
```

#### Restart Server
```bash
./dist/cli.js restart
```

#### Check Status
```bash
./dist/cli.js status
```

#### Health Check
```bash
curl -s http://127.0.0.1:3456/health
# Should return: {"status":"ok","timestamp":"..."}
```

---

### Model & Preset Management

#### Interactive Model Selection
```bash
./dist/cli.js model
```

#### List Installed Presets
```bash
./dist/cli.js preset list
```

#### Export Current Config as Preset
```bash
./dist/cli.js preset export my-config
```

#### Install Preset from File/URL
```bash
# From local directory
./dist/cli.js preset install /path/to/preset

# From GitHub marketplace
./dist/cli.js install preset-name
```

#### Delete a Preset
```bash
./dist/cli.js preset delete preset-name
```

---

### Shell Integration

#### Activate Environment Variables
```bash
# Output env vars for Claude Code
./dist/cli.js activate

# Apply to current shell
eval "$(./dist/cli.js activate)"

# This sets:
# - ANTHROPIC_API_KEY
# - ANTHROPIC_BASE_URL=http://127.0.0.1:3456
```

#### Run Claude Code Through CCR
```bash
# Using ccr code command
./dist/cli.js code "Write a hello world program"

# Using eval activation
eval "$(./dist/cli.js activate)"
claude

# Manual export
export ANTHROPIC_API_KEY="your-secret-key"
export ANTHROPIC_BASE_URL="http://127.0.0.1:3456"
claude
```

---

### API Testing (Outside Claude Code)

#### Test Health Endpoint
```bash
curl -s http://127.0.0.1:3456/health
```

#### List Available Transformers/Providers
```bash
curl -s http://127.0.0.1:3456/api/transformers
```

#### Test GLM-5.1 Model
```bash
curl -X POST http://127.0.0.1:3456/v1/messages \
  -H "x-api-key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "opencode,glm-5.1",
    "max_tokens": 50,
    "messages": [{"role": "user", "content": "Say hello in 5 words"}]
  }'
```

#### Test MiniMax M2.7 Model
```bash
curl -X POST http://127.0.0.1:3456/v1/messages \
  -H "x-api-key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "opencode,minimax-m2.7",
    "max_tokens": 50,
    "messages": [{"role": "user", "content": "Say hello in 5 words"}]
  }'
```

#### Test DeepSeek V4 Model
```bash
curl -X POST http://127.0.0.1:3456/v1/messages \
  -H "x-api-key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek,deepseek-chat",
    "max_tokens": 50,
    "messages": [{"role": "user", "content": "Say hello in 5 words"}]
  }'
```

#### Test DeepSeek Reasoner (Thinking Model)
```bash
curl -X POST http://127.0.0.1:3456/v1/messages \
  -H "x-api-key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek,deepseek-reasoner",
    "max_tokens": 500,
    "messages": [{"role": "user", "content": "Explain quantum computing"}]
  }'
```

---

## Commands Inside Claude Code CLI

### Model Switching

#### Interactive Model Selection
```
/model
```
Opens interactive prompt showing:
- `opencode,glm-5.1` (default)
- `opencode,minimax-m2.7` (think mode)
- `opencode,qwen3.6-plus`
- `deepseek,deepseek-chat` (fast mode)
- `deepseek,deepseek-reasoner` (reasoning)

#### Direct Model Switch
```
/model opencode,glm-5.1
/model opencode,minimax-m2.7
/model opencode,qwen3.6-plus
/model deepseek,deepseek-chat
/model deepseek,deepseek-reasoner
```

#### Check Current Model
```
/model
# Displays current model in use
```

---

### Subagent Model Selection

Use special tags to specify models for subagents:

```
<CCR-SUBAGENT-MODEL>opencode,minimax-m2.7</CCR-SUBAGENT-MODEL>
Please help me analyze this code...
```

```
<CCR-SUBAGENT-MODEL>deepseek,deepseek-reasoner</CCR-SUBAGENT-MODEL>
Think carefully about this problem...
```

---

### Routing Scenarios (Automatic)

Claude Code Router automatically routes to different models based on context:

| Scenario | Model Used | Trigger |
|----------|-------------|--------|
| **Default** | `opencode,glm-5.1` | Normal requests |
| **Think/Plan Mode** | `opencode,minimax-m2.7` | Complex reasoning, planning |
| **Fast** | `deepseek,deepseek-chat` | Quick responses, background tasks |
| **Background** | `deepseek,deepseek-chat` | Non-interactive tasks |

Configure in `~/.claude-code-router/config.json`:
```json
{
  "Router": {
    "default": "opencode,glm-5.1",
    "think": "opencode,minimax-m2.7",
    "fast": "deepseek,deepseek-chat",
    "background": "deepseek,deepseek-chat"
  }
}
```

---

## Quick Reference Table

### Outside Claude Code

| Action | Command | Notes |
|--------|---------|-------|
| **Start router** | `./dist/cli.js start` | From project dir |
| **Stop router** | `./dist/cli.js stop` | Or `pkill -f "cli.js"` |
| **Restart router** | `./dist/cli.js restart` | |
| **Check status** | `./dist/cli.js status` | |
| **Health check** | `curl http://127.0.0.1:3456/health` | Should return `{"status":"ok"}` |
| **Switch model (interactive)** | `./dist/cli.js model` | |
| **List presets** | `./dist/cli.js preset list` | |
| **Export config** | `./dist/cli.js preset export <name>` | |
| **Activate for shell** | `eval "$(./dist/cli.js activate)"` | Sets env vars |
| **Run Claude** | `./dist/cli.js code "prompt"` | Through CCR |
| **Test API** | `curl -X POST http://127.0.0.1:3456/v1/messages ...` | With x-api-key header |

### Inside Claude Code

| Action | Command | Notes |
|--------|---------|-------|
| **Switch model (interactive)** | `/model` | Opens selection UI |
| **Switch to GLM-5.1** | `/model opencode,glm-5.1` | Default model |
| **Switch to MiniMax** | `/model opencode,minimax-m2.7` | Think mode |
| **Switch to DeepSeek** | `/model deepseek,deepseek-chat` | Fast mode |
| **Switch to DeepSeek Reasoner** | `/model deepseek,deepseek-reasoner` | Reasoning model |
| **Subagent model** | `<CCR-SUBAGENT-MODEL>model</CCR-SUBAGENT-MODEL>` | For subagents |

---

## Log & Debug Commands

### View Logs
```bash
# Server logs (pino format)
tail -f ~/.claude-code-router/logs/ccr-*.log

# Application logs
cat ~/.claude-code-router/claude-code-router.log

# Check provider registration
grep "provider registered" ~/.claude-code-router/logs/ccr-*.log

# Check for errors
grep '"level":50' ~/.claude-code-router/logs/ccr-*.log
```

### Debug Config
```bash
# View global config
cat ~/.claude-code-router/config.json | jq .

# View project config
cat ~/.claude/projects/*/claude-code-router.json | jq .

# Validate JSON
cat ~/.claude-code-router/config.json | jq . > /dev/null && echo "Valid JSON"
```

### Check Processes
```bash
# Is server running?
ps aux | grep "cli.js" | grep -v grep

# Is port in use?
lsof -i :3456

# Check what's listening
netstat -tlnp | grep 3456
```

---

## Complete Workflow Example

### Terminal Session 1: Start Router
```bash
# Navigate to project
cd /home/gogo/dev_projects/claude-code-router-1

# Start server
./dist/cli.js start

# Verify it's running
curl http://127.0.0.1:3456/health
```

### Terminal Session 2: Use Claude Code
```bash
# Activate CCR environment
cd /home/gogo/dev_projects/claude-code-router-1
eval "$(./dist/cli.js activate)"

# Launch Claude Code
claude

# Inside Claude Code, switch models:
# /model opencode,minimax-m2.7
# /model deepseek,deepseek-chat
```

### Test API Directly
```bash
# Test all models
API_KEY="your-secret-key"

# GLM-5.1
curl -X POST http://127.0.0.1:3456/v1/messages \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"opencode,glm-5.1","max_tokens":50,"messages":[{"role":"user","content":"Hi"}]}'

# MiniMax M2.7
curl -X POST http://127.0.0.1:3456/v1/messages \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"opencode,minimax-m2.7","max_tokens":50,"messages":[{"role":"user","content":"Hi"}]}'

# DeepSeek V4
curl -X POST http://127.0.0.1:3456/v1/messages \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek,deepseek-chat","max_tokens":50,"messages":[{"role":"user","content":"Hi"}]}'
```

---

## Configuration File Locations

| Config Type | Location | Priority |
|-------------|----------|----------|
| **Global config** | `~/.claude-code-router/config.json` | Low |
| **Project config** | `~/.claude/projects/<hashed-path>/claude-code-router.json` | High |
| **Environment vars** | `~/.claude-code-router/.env` | Medium |
| **Server logs** | `~/.claude-code-router/logs/ccr-*.log` | N/A |
| **App logs** | `~/.claude-code-router/claude-code-router.log` | N/A |

---

## Help & Version

```bash
# Show help
./dist/cli.js --help
# or
./dist/cli.js -h

# Show version
./dist/cli.js --version
# or
./dist/cli.js -v

# Show Claude Code version
claude --version
```

---

## Available Models (After Setup)

### OpenCode-Go Models
- `opencode,glm-5.1` - GLM-5.1 (default, balanced)
- `opencode,minimax-m2.7` - MiniMax M2.7 (thinking tasks)
- `opencode,qwen3.6-plus` - Qwen 3.6+ (long context)

### DeepSeek Models
- `deepseek,deepseek-chat` - DeepSeek V4 (fast, efficient)
- `deepseek,deepseek-reasoner` - DeepSeek Reasoner (enhanced reasoning)

### Usage in Commands
```bash
# Outside Claude Code
curl ... -d '{"model":"opencode,glm-5.1",...}'

# Inside Claude Code
/model opencode,glm-5.1
```
