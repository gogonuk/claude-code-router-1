# Claude Code Router - Command Reference

## Overview

Claude Code Router (CCR) acts as a middleware that routes Claude Code requests to various LLM providers through a unified local API. It supports OpenAI-compatible endpoints (`openai-opencode`) and Anthropic-compatible endpoints (`anthropic-opencode`).

---

## Quick Start

```bash
# 1. Navigate to CCR project directory
cd /home/gogo/dev_projects/claude-code-router-1

# 2. Start the router server
./dist/cli.js start

# 3. Activate environment variables in your shell
eval "$(./dist/cli.js activate)"

# 4. Run Claude Code - it will automatically route through CCR
claude
```

---

## Server Management Commands

### Starting the Server

```bash
# Standard start (runs in foreground)
cd /home/gogo/dev_projects/claude-code-router-1
./dist/cli.js start

# Start as background process with logging
nohup ./dist/cli.js start > /tmp/ccr.log 2>&1 &

# Start with environment variables (if using .env file)
export DEEPSEEK_API_KEY="sk-..."
export OPENCODE_API_KEY="sk-..."
./dist/cli.js start
```

### Stopping the Server

```bash
# Graceful stop using CCR command
./dist/cli.js stop

# Or force kill manually
pkill -f "cli.js"
```

### Restarting the Server

```bash
# Stop and start in one command
./dist/cli.js restart
```

### Checking Server Status

```bash
# Shows if server is running, port, PID, and API endpoint
./dist/cli.js status
```

### Health Check

```bash
# Verify server is responding
curl -s http://127.0.0.1:3456/health

# Expected response: {"status":"ok","timestamp":"..."}
```

---

## Model & Preset Management

### Interactive Model Selection

```bash
# Opens an interactive prompt to choose models
./dist/cli.js model
```

### Preset Management

```bash
# List all installed presets
./dist/cli.js preset list

# Export current configuration as a named preset
./dist/cli.js preset export my-config

# Install a preset from a local directory
./dist/cli.js preset install /path/to/preset

# Install a preset from GitHub marketplace
./dist/cli.js install preset-name

# Delete a preset
./dist/cli.js preset delete preset-name
```

---

## Shell Integration

### Activating CCR Environment

```bash
# Output environment variables needed for CCR (run this first)
./dist/cli.js activate

# Apply environment variables to current shell
eval "$(./dist/cli.js activate)"

# What this sets:
# - ANTHROPIC_BASE_URL=http://127.0.0.1:3456
# - ANTHROPIC_AUTH_TOKEN=<your-api-key>
```

### Running Claude Code Through CCR

```bash
# Method 1: Using CCR's built-in code command
./dist/cli.js code "Write a hello world program"

# Method 2: Using eval activation
eval "$(./dist/cli.js activate)"
claude

# Method 3: Manual export (alternative)
export ANTHROPIC_AUTH_TOKEN="ccr-secret-key"
export ANTHROPIC_BASE_URL="http://127.0.0.1:3456"
claude
```

---

## API Testing (Direct HTTP Requests)

### Test Health Endpoint

```bash
curl -s http://127.0.0.1:3456/health
```

### List Available Transformers and Providers

```bash
curl -s http://127.0.0.1:3456/api/transformers
```

### Test Kimi K2.6 Model (OpenAI-compatible)

```bash
curl -X POST http://127.0.0.1:3456/v1/messages \
  -H "x-api-key: ccr-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai-opencode,kimi-k2.6",
    "max_tokens": 50,
    "messages": [{"role": "user", "content": "Say hello in 5 words"}]
  }'
```

### Test DeepSeek V4 Pro Model (OpenAI-compatible)

```bash
curl -X POST http://127.0.0.1:3456/v1/messages \
  -H "x-api-key: ccr-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai-opencode,DeepSeek V4 Pro",
    "max_tokens": 50,
    "messages": [{"role": "user", "content": "Say hello in 5 words"}]
  }'
```

### Test Mimo V2.5 Pro Model (OpenAI-compatible)

```bash
curl -X POST http://127.0.0.1:3456/v1/messages \
  -H "x-api-key: ccr-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai-opencode,mimo-v2.5-pro",
    "max_tokens": 50,
    "messages": [{"role": "user", "content": "Say hello in 5 words"}]
  }'
```

### Test MiniMax M2.7 Model (Anthropic-compatible)

```bash
curl -X POST http://127.0.0.1:3456/v1/messages \
  -H "x-api-key: ccr-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "anthropic-opencode,MiniMax M2.7",
    "max_tokens": 50,
    "messages": [{"role": "user", "content": "Say hello in 5 words"}]
  }'
```

### Test Qwen3.6 Plus Model (Anthropic-compatible)

```bash
curl -X POST http://127.0.0.1:3456/v1/messages \
  -H "x-api-key: ccr-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "anthropic-opencode,Qwen3.6 Plus",
    "max_tokens": 50,
    "messages": [{"role": "user", "content": "Say hello in 5 words"}]
  }'
```

---

## Commands Inside Claude Code CLI

### Model Switching

#### Interactive Model Selection

```
/model
```

Opens an interactive prompt showing available models:
- `openai-opencode,kimi-k2.6` (think mode)
- `openai-opencode,DeepSeek V4 Pro` (default)
- `openai-opencode,mimo-v2.5-pro`
- `anthropic-opencode,MiniMax M2.7` (background)
- `anthropic-opencode,Qwen3.6 Plus`
- `anthropic-opencode,MiMo-V2.5-Pro`

#### Direct Model Switch

```
/model openai-opencode,kimi-k2.6
/model openai-opencode,DeepSeek V4 Pro
/model anthropic-opencode,MiniMax M2.7
/model anthropic-opencode,Qwen3.6 Plus
```

#### Check Current Model

```
/model
# Displays current model in use
```

---

## Subagent Model Selection

Use special tags to specify different models for subagents:

```
<CCR-SUBAGENT-MODEL>openai-opencode,kimi-k2.6</CCR-SUBAGENT-MODEL>
Please help me analyze this code with deep reasoning...
```

```
<CCR-SUBAGENT-MODEL>anthropic-opencode,MiniMax M2.7</CCR-SUBAGENT-MODEL>
Run this quick background task...
```

---

## Routing Scenarios (Automatic)

Claude Code Router automatically routes to different models based on the scenario. This is configured in `~/.claude-code-router/config.json`:

```json
{
  "Router": {
    "default": "openai-opencode,DeepSeek V4 Pro",
    "background": "anthropic-opencode,MiniMax M2.7",
    "think": "openai-opencode,kimi-k2.6",
    "longContext": "openai-opencode,DeepSeek V4 Pro",
    "webSearch": "anthropic-opencode,MiniMax M2.7"
  }
}
```

### Scenario Mapping

| Scenario | Model Used | Trigger |
|----------|-------------|---------|
| **Default** | `openai-opencode,DeepSeek V4 Pro` | Normal requests |
| **Think/Plan Mode** | `openai-opencode,kimi-k2.6` | Complex reasoning, planning |
| **Background** | `anthropic-opencode,MiniMax M2.7` | Non-interactive tasks |
| **Long Context** | `openai-opencode,DeepSeek V4 Pro` | Large context windows |
| **Web Search** | `anthropic-opencode,MiniMax M2.7` | Search-related tasks |

---

## Quick Reference Table

### Outside Claude Code (Terminal)

| Action | Command | Notes |
|--------|---------|-------|
| **Start router** | `./dist/cli.js start` | From project directory |
| **Stop router** | `./dist/cli.js stop` | Or `pkill -f "cli.js"` |
| **Restart router** | `./dist/cli.js restart` | |
| **Check status** | `./dist/cli.js status` | Shows PID, port, endpoint |
| **Health check** | `curl http://127.0.0.1:3456/health` | Returns `{"status":"ok"}` |
| **Switch model (interactive)** | `./dist/cli.js model` | |
| **List presets** | `./dist/cli.js preset list` | |
| **Export config** | `./dist/cli.js preset export <name>` | |
| **Activate for shell** | `eval "$(./dist/cli.js activate)"` | Sets env vars |
| **Run Claude through CCR** | `./dist/cli.js code "prompt"` | Direct prompt |
| **Test API directly** | `curl -X POST http://127.0.0.1:3456/v1/messages ...` | Include x-api-key header |

### Inside Claude Code

| Action | Command | Notes |
|--------|---------|-------|
| **Switch model (interactive)** | `/model` | Opens selection UI |
| **Switch to DeepSeek V4 Pro** | `/model openai-opencode,DeepSeek V4 Pro` | Default model |
| **Switch to Kimi K2.6** | `/model openai-opencode,kimi-k2.6` | Think mode |
| **Switch to MiniMax M2.7** | `/model anthropic-opencode,MiniMax M2.7` | Background mode |
| **Switch to Qwen3.6 Plus** | `/model anthropic-opencode,Qwen3.6 Plus` | Alternative |
| **Subagent model tag** | `<CCR-SUBAGENT-MODEL>model</CCR-SUBAGENT-MODEL>` | For subagents |

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

# Check for errors (level 50 = error)
grep '"level":50' ~/.claude-code-router/logs/ccr-*.log
```

### Debug Configuration

```bash
# View global config (formatted)
cat ~/.claude-code-router/config.json | jq .

# View project-specific config
cat ~/.claude/projects/*/claude-code-router.json | jq .

# Validate JSON syntax
cat ~/.claude-code-router/config.json | jq . > /dev/null && echo "Valid JSON"
```

### Check Processes

```bash
# Is server running?
ps aux | grep "cli.js" | grep -v grep

# Is port 3456 in use?
lsof -i :3456

# Check what's listening on port 3456
netstat -tlnp | grep 3456
```

---

## Complete Workflow Example

### Terminal Session 1: Start Router

```bash
# Navigate to CCR project directory
cd /home/gogo/dev_projects/claude-code-router-1

# Start the server
./dist/cli.js start

# Verify it's running
curl http://127.0.0.1:3456/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Terminal Session 2: Use Claude Code

```bash
# Navigate to CCR project directory
cd /home/gogo/dev_projects/claude-code-router-1

# Activate CCR environment variables
eval "$(./dist/cli.js activate)"

# Launch Claude Code - it will route through CCR
claude

# Inside Claude Code, you can switch models:
# /model openai-opencode,kimi-k2.6
# /model anthropic-opencode,MiniMax M2.7
```

### Test All Models via API

```bash
# Set API key for testing
API_KEY="ccr-secret-key"

# Test DeepSeek V4 Pro (OpenAI-compatible)
curl -X POST http://127.0.0.1:3456/v1/messages \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai-opencode,DeepSeek V4 Pro","max_tokens":50,"messages":[{"role":"user","content":"Hi"}]}'

# Test Kimi K2.6 (OpenAI-compatible)
curl -X POST http://127.0.0.1:3456/v1/messages \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai-opencode,kimi-k2.6","max_tokens":50,"messages":[{"role":"user","content":"Hi"}]}'

# Test MiniMax M2.7 (Anthropic-compatible)
curl -X POST http://127.0.0.1:3456/v1/messages \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"anthropic-opencode,MiniMax M2.7","max_tokens":50,"messages":[{"role":"user","content":"Hi"}]}'
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

## Help & Version Information

```bash
# Show help message
./dist/cli.js --help
# or
./dist/cli.js -h

# Show version
./dist/cli.js --version
# or
./dist/cli.js -v

# Show Claude Code version (when CCR is active)
claude --version
```

---

## Available Models

### OpenAI-Compatible Models (via `openai-opencode`)

These models use the `/v1/chat/completions` endpoint:

| Model ID | Description | Best For |
|----------|-------------|----------|
| `DeepSeek V4 Pro` | DeepSeek's flagship model | Default, balanced performance |
| `kimi-k2.6` | Kimi K2.6 model | Thinking/reasoning tasks |
| `mimo-v2.5-pro` | Mimo V2.5 Pro model | Fast responses |

### Anthropic-Compatible Models (via `anthropic-opencode`)

These models use the `/v1/messages` endpoint:

| Model ID | Description | Best For |
|----------|-------------|----------|
| `MiniMax M2.7` | MiniMax M2.7 model | Background tasks, fast mode |
| `Qwen3.6 Plus` | Qwen 3.6 Plus model | Alternative fast model |
| `MiMo-V2.5-Pro` | MiMo V2.5 Pro model | Long context tasks |

---

## Provider Configuration

The `config.json` uses these provider names:

```json
{
  "Providers": [
    {
      "name": "openai-opencode",
      "api_base_url": "https://opencode.ai/zen/go/v1/chat/completions",
      "api_key": "sk-...",
      "models": ["DeepSeek V4 Pro", "kimi-k2.6", "mimo-v2.5-pro"],
      "transformer": {
        "use": ["OpenAI"],
        "DeepSeek V4 Pro": { "use": ["deepseek"] }
      }
    },
    {
      "name": "anthropic-opencode",
      "api_base_url": "https://opencode.ai/zen/go/v1/messages",
      "api_key": "sk-...",
      "models": ["Qwen3.6 Plus", "MiniMax M2.7", "MiMo-V2.5-Pro"],
      "transformer": {
        "use": ["Anthropic"]
      }
    }
  ]
}
```

### Model String Format

The model string format is: `provider-name,model-name`

Examples:
- `openai-opencode,DeepSeek V4 Pro`
- `openai-opencode,kimi-k2.6`
- `anthropic-opencode,MiniMax M2.7`

---

## Troubleshooting

### Server Won't Start

```bash
# Check if port is already in use
lsof -i :3456

# Kill existing processes
pkill -f "cli.js"

# Check logs for errors
cat ~/.claude-code-router/logs/ccr-*.log | tail -50
```

### Provider Not Found Error

- Verify the provider name in your config matches exactly
- Check that the provider has models defined
- Ensure `Providers` uses capital P (array format)

### Model Not Supported Error

- Check the model name matches exactly (case-sensitive)
- Verify the model is listed in the provider's `models` array

### Authentication Errors

- Ensure `x-api-key` header matches `APIKEY` in config
- For Claude Code, ensure `ANTHROPIC_AUTH_TOKEN` is set correctly

---

## DeepSeek Integration

This section covers all commands for integrating and using DeepSeek V4 Pro and V4 Flash models with Claude Code Router.

### Prerequisites

- DeepSeek API key from https://api.deepseek.com
- CCR server running (see [Quick Start](#quick-start))

### Step 1: Configure DeepSeek Provider

Edit `~/.claude-code-router/config.json` and add the DeepSeek provider to the `Providers` array:

```bash
# Open config for editing
nano ~/.claude-code-router/config.json
```

Add this provider block:

```json
{
  "name": "deepseek",
  "api_base_url": "https://api.deepseek.com/v1/chat/completions",
  "api_key": "sk-your-deepseek-api-key",
  "models": [
    "deepseek-v4-pro",
    "deepseek-v4-flash"
  ],
  "transformer": {
    "use": ["deepseek"]
  }
}
```

### Step 2: Configure Router for DeepSeek

Update the `Router` section in `~/.claude-code-router/config.json`:

```bash
# Edit router configuration
nano ~/.claude-code-router/config.json
```

Set routing rules:

```json
"Router": {
  "default": "deepseek,deepseek-v4-flash",
  "background": "deepseek,deepseek-v4-flash",
  "think": "deepseek,deepseek-v4-pro",
  "longContext": "deepseek,deepseek-v4-pro",
  "webSearch": "deepseek,deepseek-v4-flash",
  "image": ""
}
```

### Step 3: Restart CCR Server

Apply the new configuration by restarting the server:

```bash
# Restart CCR
cd /home/gogo/dev_projects/claude-code-router-1
./dist/cli.js restart

# Verify DeepSeek provider is loaded
grep "deepseek provider registered" ~/.claude-code-router/logs/ccr-*.log

# Check server is running
curl -s http://127.0.0.1:3456/health
```

### Step 4: Activate CCR Environment

```bash
# Activate CCR environment variables
eval "$(cd /home/gogo/dev_projects/claude-code-router-1 && ./dist/cli.js activate)"

# Verify environment variables are set
echo $ANTHROPIC_BASE_URL  # Should show: http://127.0.0.1:3456
echo $ANTHROPIC_AUTH_TOKEN  # Should show: ccr-secret-key
```

### Testing DeepSeek Models

#### Test DeepSeek V4 Flash (Fast/Background)

```bash
curl -X POST http://127.0.0.1:3456/v1/messages \
  -H "x-api-key: ccr-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek,deepseek-v4-flash",
    "max_tokens": 50,
    "messages": [{"role": "user", "content": "Say hello in 5 words"}]
  }'
```

#### Test DeepSeek V4 Pro (Thinking/Complex)

```bash
curl -X POST http://127.0.0.1:3456/v1/messages \
  -H "x-api-key: ccr-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek,deepseek-v4-pro",
    "max_tokens": 50,
    "messages": [{"role": "user", "content": "Explain quantum computing in 2 sentences"}]
  }'
```

### Using DeepSeek in Claude Code

#### Interactive Model Selection

```
/model
# Navigate to DeepSeek models in the interactive prompt
```

#### Direct Model Switch

```
/model deepseek,deepseek-v4-flash    # For fast tasks
/model deepseek,deepseek-v4-pro      # For thinking tasks
```

#### Check Current Model

```
/model
# Shows current model with provider info
```

### Subagent Model Selection with DeepSeek

Use special tags to route subagents to specific DeepSeek models:

```
<CCR-SUBAGENT-MODEL>deepseek,deepseek-v4-flash</CCR-SUBAGENT-MODEL>
Run this quick background analysis...
```

```
<CCR-SUBAGENT-MODEL>deepseek,deepseek-v4-pro</CCR-SUBAGENT-MODEL>
Please help me analyze this code with deep reasoning...
```

### Routing Scenarios with DeepSeek

CCR automatically routes requests based on task type:

| Scenario | DeepSeek Model | When Used |
|----------|---------------|-----------|
| **default** | `deepseek-v4-flash` | Normal requests, quick tasks |
| **background** | `deepseek-v4-flash` | Background processing, non-interactive |
| **think** | `deepseek-v4-pro` | Complex reasoning, planning |
| **longContext** | `deepseek-v4-pro` | Large context windows, detailed analysis |
| **webSearch** | `deepseek-v4-flash` | Search-related tasks |

### DeepSeek API Testing Commands

#### Verify DeepSeek Provider Registration

```bash
# Check logs for successful registration
grep "deepseek provider registered" ~/.claude-code-router/logs/ccr-*.log

# List available transformers
curl -s http://127.0.0.1:3456/api/transformers | jq .
```

#### Test Direct DeepSeek API (Bypassing CCR)

```bash
# Test DeepSeek API directly
curl -X POST https://api.deepseek.com/v1/chat/completions \
  -H "Authorization: Bearer sk-your-deepseek-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-v4-flash",
    "max_tokens": 50,
    "messages": [{"role": "user", "content": "Hi"}]
  }'
```

### DeepSeek Environment Variables

For direct DeepSeek API usage (not through CCR):

```bash
# Set DeepSeek API key
export DEEPSEEK_API_KEY="sk-your-deepseek-api-key"

# For Anthropic compatibility layer
export ANTHROPIC_BASE_URL="https://api.deepseek.com/anthropic"
export ANTHROPIC_API_KEY="sk-your-deepseek-api-key"

# Note: When using Anthropic format with DeepSeek,
# unsupported model names auto-map to deepseek-v4-flash
```

### Troubleshooting DeepSeek Integration

#### Provider Not Registered

```bash
# Check if DeepSeek provider loaded correctly
cat ~/.claude-code-router/config.json | jq '.Providers[] | select(.name=="deepseek")'

# Verify API key is set (look for last 4 chars)
grep "api_key" ~/.claude-code-router/config.json
```

#### Model Not Found Error

```bash
# Verify model names exactly match DeepSeek's names
# Correct: deepseek-v4-pro, deepseek-v4-flash
# Incorrect: deepseek-v4, deepseek-pro, deepseek-flash
```

#### API Key Issues

```bash
# Test your DeepSeek API key directly
curl -X POST https://api.deepseek.com/v1/chat/completions \
  -H "Authorization: Bearer sk-your-deepseek-api-key" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4-flash","max_tokens":10,"messages":[{"role":"user","content":"test"}]}'

# If direct API fails, check your key at https://api.deepseek.com
```

### Quick DeepSeek Workflow

#### Complete Setup from Scratch

```bash
# 1. Navigate to CCR
cd /home/gogo/dev_projects/claude-code-router-1

# 2. Add DeepSeek provider (edit config)
nano ~/.claude-code-router/config.json
# Add the deepseek provider block from Step 1 above

# 3. Update router configuration
# Edit Router section as shown in Step 2 above

# 4. Start/restart CCR
./dist/cli.js restart

# 5. Verify DeepSeek loaded
curl -s http://127.0.0.1:3456/health

# 6. Activate and use
eval "$(./dist/cli.js activate)"
claude

# 7. Inside Claude Code, use DeepSeek:
# /model deepseek,deepseek-v4-flash  (fast tasks)
/model deepseek,deepseek-v4-pro      (complex reasoning)
```

### DeepSeek Model Selection Reference

| Model | Best For | Command to Switch |
|-------|----------|-------------------|
| `deepseek-v4-flash` | Fast responses, background tasks, web search | `/model deepseek,deepseek-v4-flash` |
| `deepseek-v4-pro` | Complex reasoning, planning, long context | `/model deepseek,deepseek-v4-pro` |

### DeepSeek API Endpoints

| Endpoint | Use | Format |
|----------|-----|--------|
| `https://api.deepseek.com/v1/chat/completions` | Direct OpenAI-compatible | OpenAI format |
| `https://api.deepseek.com/anthropic` | Anthropic ecosystem | Anthropic format (auto-maps unsupported models to flash) |