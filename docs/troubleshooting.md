# Troubleshooting Guide

## Common Issues and Solutions

### 1. Server Fails to Start

**Symptoms:**
- `curl http://127.0.0.1:3456/health` returns "Connection refused"
- No server process found in `ps aux | grep cli.js`

**Debug Steps:**
```bash
# Check if server binary exists
ls -la /path/to/claude-code-router-1/dist/cli.js

# Try running in foreground to see errors
cd /path/to/claude-code-router-1
./dist/cli.js start

# Check for port conflicts
lsof -i :3456
```

**Solution:**
- Ensure project is built: `pnpm build`
- Kill conflicting processes: `pkill -f "cli.js"`
- Check config syntax: `cat ~/.claude-code-router/config.json | jq .`

---

### 2. "Provider 'X' not found" Error

**Symptoms:**
```json
{"error":{"message":"Provider 'opencode' not found","type":"provider_not_found"}}
```

**Root Cause:**
Config uses wrong format. The server expects `Providers` (capital P) as an **array**.

**Wrong Config (Object format - doesn't work):**
```json
{
  "providers": {
    "opencode": {"api_key": "...", "api_base_url": "..."}
  }
}
```

**Correct Config (Array format - works):**
```json
{
  "Providers": [
    {
      "name": "opencode",
      "api_key": "...",
      "api_base_url": "..."
    }
  ]
}
```

**Debug:**
```bash
# Check if providers are registered
grep "provider registered" ~/.claude-code-router/logs/ccr-*.log

# Should show:
# {"msg":"opencode provider registered"}
# {"msg":"deepseek provider registered"}
```

---

### 3. Environment Variable Interpolation Not Working

**Symptoms:**
- Config has `"api_key": "$OPENCODE_API_KEY"` but requests fail with auth errors
- Logs show literal `$OPENCODE_API_KEY` instead of the actual key

**Root Cause:**
The `interpolateEnvVars()` function in `packages/server/src/utils/index.ts` doesn't work properly in the compiled `dist/cli.js`.

**Workaround:**
Store API keys directly in config.json:
```json
{
  "Providers": [
    {
      "name": "opencode",
      "api_key": "sk-1v1X4kUKCLHZgsQ8ux3sFztbydEd4WK9CRE0RaKOdLJ18EKe4lfn1vceiudfwIRa",
      "api_base_url": "https://opencode.ai/zen/go/v1/chat/completions"
    }
  ]
}
```

**Security Note:** This is less secure as keys are stored in plaintext. Use proper file permissions:
```bash
chmod 600 ~/.claude-code-router/config.json
```

**For Developers - Fix Approach:**
The interpolation regex in `utils/index.ts`:
```typescript
return obj.replace(/\$\{([^}]+)\}|\$([A-Z_][A-Z0-9_]*)/g, (match, braced, unbraced) => {
  const varName = braced || unbraced;
  return process.env[varName] || match;
});
```

Check if `process.env[varName]` is actually set when the server runs.

---

### 4. OpenCode-Go MiniMax Endpoint Returns 401

**Symptoms:**
```json
{"error":{"message":"Error from provider: Missing API key.","code":"provider_response_error"}}
```

**Root Cause:**
The `/v1/messages` endpoint expects `x-api-key` header, but CCR sends `Authorization: Bearer`.

**Solution:**
Use the OpenAI-compatible endpoint `/v1/chat/completions` for all OpenCode-Go models:
```json
{
  "name": "opencode",
  "api_base_url": "https://opencode.ai/zen/go/v1/chat/completions",
  "api_key": "sk-..."
}
```

This works for:
- GLM-5.1
- MiniMax M2.7
- Qwen 3.6+

---

### 5. API Requests Return 401 Unauthorized

**Symptoms:**
```bash
curl -X POST http://127.0.0.1:3456/v1/messages ...
# Returns 401
```

**Debug Steps:**
1. Check if `APIKEY` is set in config.json
2. Verify the `x-api-key` header is sent
3. Check server logs for auth errors

```bash
# Check config
cat ~/.claude-code-router/config.json | grep APIKEY

# Test with correct header
curl -X POST http://127.0.0.1:3456/v1/messages \
  -H "x-api-key: your-secret-key-here" \
  ...
```

**Note:** The server requires `APIKEY` in config when providers are configured. This is the key clients must send in `x-api-key` header.

---

### 6. Server Starts But No Providers Loaded

**Symptoms:**
- Health check works
- API requests fail with "No providers configured"
- Logs show: `"ℹ️  No providers configured. Listening on 0.0.0.0 without authentication."`

**Root Cause:**
Config file not found or not parsed correctly.

**Debug:**
```bash
# Check config file location
ls -la ~/.claude-code-router/config.json

# Check config is valid JSON5
cat ~/.claude-code-router/config.json

# Check server logs for config loading
grep "Loaded JSON config" ~/.claude-code-router/logs/ccr-*.log
```

**Solution:**
Ensure config is at `~/.claude-code-router/config.json` (NOT in project directory).

---

### 7. Build Errors

**Symptoms:**
```bash
pnpm build
# Fails with TypeScript errors
```

**Solution:**
```bash
# Clean and rebuild
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build

# If still failing, try building individual packages
pnpm build:server
pnpm build:cli
```

---

### 8. Claude Code CLI Not Connecting

**Symptoms:**
```bash
claude
# Opens but uses default Anthropic API, not CCR
```

**Solution:**
Set environment variables correctly:
```bash
export ANTHROPIC_API_KEY="your-ccr-api-key"
export ANTHROPIC_BASE_URL="http://127.0.0.1:3456"
claude
```

Or use the activation command:
```bash
eval "$(cd /path/to/claude-code-router-1 && ./dist/cli.js activate)"
claude
```

---

## Log Analysis

### Important Log Patterns

**Successful provider registration:**
```
{"msg":"opencode provider registered"}
{"msg":"deepseek provider registered"}
```

**Successful request:**
```
{"msg":"incoming request","url":"/v1/messages"}
{"msg":"final request","requestUrl":"https://opencode.ai/zen/go/v1/chat/completions"}
{"msg":"request completed","statusCode":200}
```

**Error patterns:**
```
{"msg":"Provider 'X' not found"}  ← Config issue
{"msg":"Missing API key"}            ← Auth issue
{"msg":"Connection refused"}          ← Network/endpoint issue
```

### Log Locations
```bash
# Server logs (pino format)
~/.claude-code-router/logs/ccr-*.log

# Application logs
~/.claude-code-router/claude-code-router.log

# Real-time log watching
tail -f ~/.claude-code-router/logs/ccr-*.log
```

---

## Quick Diagnostic Commands

```bash
# 1. Is server running?
ps aux | grep "cli.js" | grep -v grep

# 2. Is port open?
curl -s http://127.0.0.1:3456/health

# 3. Are providers registered?
grep "provider registered" ~/.claude-code-router/logs/ccr-*.log

# 4. Is config valid?
cat ~/.claude-code-router/config.json | jq .

# 5. Can we reach the API?
curl -X POST http://127.0.0.1:3456/v1/messages \
  -H "x-api-key: test-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"model":"opencode,glm-5.1","max_tokens":10,"messages":[{"role":"user","content":"Hi"}]}'

# 6. Check environment variables
env | grep -E "DEEPSEEK|OPENCODE|ANTHROPIC"
```

---

## Getting Help

1. Check `~/.claude-code-router/logs/ccr-*.log` first
2. Run server in foreground: `./dist/cli.js start`
3. Verify config format (see `docs/opencode-go-setup.md`)
4. Test API directly (bypass CCR):
   ```bash
   curl -X POST https://opencode.ai/zen/go/v1/chat/completions \
     -H "Authorization: Bearer sk-..." \
     -H "Content-Type: application/json" \
     -d '{"model":"glm-5.1","messages":[{"role":"user","content":"Hi"}]}'
   ```
5. Open issue at: https://github.com/gogonuk/claude-code-router-1/issues
