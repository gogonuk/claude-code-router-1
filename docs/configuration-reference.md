# Configuration Reference

## Config File Locations

### Global Config (Priority: Low)
`~/.claude-code-router/config.json`

### Project-Specific Config (Priority: High)
`~/.claude/projects/<project-path-hashed>/claude-code-router.json`

Example: For project `/home/gogo/dev_projects/my-app`, config at:
`~/.claude/projects/-home-gogo-dev-projects-my-app/claude-code-router.json`

---

## Config Format

### Minimal Config
```json
{
  "APIKEY": "your-secret-key",
  "PORT": 3456,
  "Providers": [
    {
      "name": "provider-name",
      "api_base_url": "https://api.example.com/v1/chat/completions",
      "api_key": "sk-your-key-here",
      "models": ["model-1", "model-2"]
    }
  ],
  "Router": {
    "default": "provider-name,model-1"
  }
}
```

---

## Top-Level Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `APIKEY` | string | Yes* | Secret key for authenticating clients. Required when Providers are configured. |
| `PORT` | number | No | Server port (default: 3456) |
| `HOST` | string | No | Server host (default: 127.0.0.1 when APIKEY set, 0.0.0.0 otherwise) |
| `Providers` | array | Yes* | Array of provider configurations. Required for routing. |
| `Router` | object | Yes* | Routing rules for different scenarios. |
| `LOG` | boolean | No | Enable/disable logging (default: true) |
| `LOG_LEVEL` | string | No | Log level: fatal, error, warn, info, debug, trace (default: debug) |
| `PROXY_URL` | string | No | HTTP proxy for API requests (e.g., "http://127.0.0.1:7890") |
| `API_TIMEOUT_MS` | number | No | API timeout in milliseconds |
| `NON_INTERACTIVE_MODE` | boolean | No | Enable for CI/CD environments (default: false) |

*Required when using provider routing.

---

## Provider Configuration

### Provider Object Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Unique provider identifier (e.g., "opencode", "deepseek") |
| `api_base_url` | string | Yes | Base URL for API requests (with underscore!) |
| `api_key` | string | Yes | API key for the provider (with underscore!) |
| `models` | array | Yes | List of model names available from this provider |
| `transformer` | object | No | Transformer configuration (see Transformers section) |

**⚠️ Important:** Use `api_base_url` and `api_key` (with underscores), NOT `base_url`/`apiKey`.

### Example: OpenCode-Go Provider
```json
{
  "name": "opencode",
  "api_base_url": "https://opencode.ai/zen/go/v1/chat/completions",
  "api_key": "sk-your-opencode-key-here",
  "models": ["glm-5.1", "minimax-m2.7", "qwen3.6-plus"],
  "transformer": {
    "use": ["openai"]
  }
}
```

### Example: DeepSeek Provider
```json
{
  "name": "deepseek",
  "api_base_url": "https://api.deepseek.com/v1/chat/completions",
  "api_key": "sk-your-deepseek-key-here",
  "models": ["deepseek-chat", "deepseek-reasoner"],
  "transformer": {
    "use": ["deepseek"],
    "deepseek-chat": {
      "use": ["tooluse"]
    }
  }
}
```

---

## Router Configuration

The `Router` object maps scenarios to provider/model combinations.

### Scenario Types

| Scenario | Description | Default Model |
|----------|-------------|---------------|
| `default` | Standard requests | Required |
| `think` | Plan mode, complex reasoning | Optional (falls back to default) |
| `fast` | Quick responses, background tasks | Optional (falls back to default) |
| `background` | Non-interactive tasks | Optional (falls back to default) |
| `longContext` | Requests exceeding token threshold | Optional (falls back to default) |
| `webSearch` | Web search tasks | Optional (falls back to default) |
| `image` | Image-related tasks | Optional (falls back to default) |

### Router Value Format
```
"provider-name,model-name"
```

### Example Router Config
```json
{
  "Router": {
    "default": "opencode,glm-5.1",
    "think": "opencode,minimax-m2.7",
    "fast": "deepseek,deepseek-chat",
    "background": "deepseek,deepseek-chat",
    "longContext": "opencode,qwen3.6-plus"
  }
}
```

---

## Fallback Configuration

Optional fallback models if primary model fails.

### Example
```json
{
  "fallback": {
    "default": ["deepseek,deepseek-chat", "opencode,qwen3.6-plus"],
    "think": ["deepseek,deepseek-reasoner"],
    "fast": ["opencode,glm-5.1"]
  }
}
```

---

## Transformer Configuration

Transformers adapt requests/responses for different provider APIs.

### Built-in Transformers
- `anthropic` - For Claude API compatibility
- `deepseek` - For DeepSeek API
- `openai` - For OpenAI-compatible APIs
- `gemini` - For Google Gemini API
- `openrouter` - For OpenRouter API
- `tooluse` - Enables tool/function calling
- `reasoning` - For reasoning models (DeepSeek-R1, etc.)
- `maxtoken` - Handles max tokens parameter
- `enhancetool` - Enhances tool definitions

### Transformer Config Structure
```json
{
  "transformer": {
    "use": ["transformer1", "transformer2"],
    "model-specific-config": {
      "use": ["specific-transformer"]
    }
  }
}
```

---

## Environment Variable Interpolation

**⚠️ Currently Broken in Compiled Code**

Config supports `$VAR_NAME` or `${VAR_NAME}` syntax, but interpolation doesn't work in `dist/cli.js`.

### Intended Usage (Not Working)
```json
{
  "Providers": [
    {
      "name": "deepseek",
      "api_key": "$DEEPSEEK_API_KEY",
      "api_base_url": "https://api.deepseek.com/v1/chat/completions"
    }
  ]
}
```

### Workaround (Use This)
Store API keys directly in config:
```json
{
  "Providers": [
    {
      "name": "deepseek",
      "api_key": "sk-abbc8bca41214dfabd10e7aaf35c14dd",
      "api_base_url": "https://api.deepseek.com/v1/chat/completions"
    }
  ]
}
```

Set proper permissions:
```bash
chmod 600 ~/.claude-code-router/config.json
```

---

## Complete Example Config

### Global Config (`~/.claude-code-router/config.json`)
```json
{
  "APIKEY": "your-secret-key-here",
  "PORT": 3456,
  "LOG": true,
  "LOG_LEVEL": "debug",
  "Providers": [
    {
      "name": "opencode",
      "api_base_url": "https://opencode.ai/zen/go/v1/chat/completions",
      "api_key": "sk-1v1X4kUKCLHZgsQ8ux3sFztbydEd4WK9CRE0RaKOdLJ18EKe4lfn1vceiudfwIRa",
      "models": ["glm-5.1", "qwen3.6-plus", "minimax-m2.7"]
    },
    {
      "name": "deepseek",
      "api_base_url": "https://api.deepseek.com/v1/chat/completions",
      "api_key": "sk-abbc8bca41214dfabd10e7aaf35c14dd",
      "models": ["deepseek-chat", "deepseek-reasoner"]
    }
  ],
  "Router": {
    "default": "opencode,glm-5.1",
    "think": "opencode,minimax-m2.7",
    "fast": "deepseek,deepseek-chat",
    "background": "deepseek,deepseek-chat"
  },
  "fallback": {
    "default": ["deepseek,deepseek-chat", "opencode,qwen3.6-plus"],
    "think": ["deepseek,deepseek-reasoner"]
  }
}
```

---

## Config Validation

Check config is valid JSON5:
```bash
# Install json5 if needed
npm install -g json5

# Validate
cat ~/.claude-code-router/config.json | json5 | jq .
```

Common validation errors:
- Trailing commas (JSON5 allows, but be careful)
- Comments (JSON5 allows `//` and `/* */`)
- Wrong field names (`api_base_url` not `base_url`)
- Wrong structure (`Providers` as array, not object)
