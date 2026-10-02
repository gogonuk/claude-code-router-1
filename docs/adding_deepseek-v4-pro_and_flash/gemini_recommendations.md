**Yes, you will be able to connect Claude Code to the Figma MCP server using DeepSeek-V3 or DeepSeek-R1 via this setup**, but there are some critical caveats regarding **tool-calling capabilities** and **configuration** that you need to be aware of.

### How the Architecture Works

Claude Code acts as the **MCP Client**. When you configure it to use a custom LLM endpoint (by pointing `ANTHROPIC_BASE_URL` to DeepSeek’s API or a gateway proxy using the compatibility guide), Claude Code translates its core functionality into the standard Anthropic Messages format `/v1/messages`.

When you add the Figma MCP server, Claude Code will ingest the Figma tools and pass their definitions down to DeepSeek inside the `tools` array of the API request.

```
┌─────────────┐                      ┌─────────────┐                      ┌──────────────┐
│             │  Reads tools/state   │             │   Anthropic API      │              │
│  MCP Figma  │ ───────────────────> │ Claude Code │ ───────────────────> │ DeepSeek LLM │
│   Server    │ <─────────────────── │ (MCP Client)│ <─────────────────── │ (Via Proxy)  │
│             │   Executes Actions   │             │   Returns Tool Call  │              │
└─────────────┘                      └─────────────┘                      └──────────────┘
```

### Crucial Success Factors

#### 1. Tool-Calling Format Compatibility

DeepSeek's native API uses the OpenAI-style function calling syntax (`tools`, `tool_calls`). For Claude Code to communicate seamlessly, your routing setup must map the Anthropic tool-calling JSON schema into OpenAI tool blocks and map DeepSeek's response back to Anthropic's `tool_use` format.

- If you are routing directly via an official translation proxy layer or an LLM Gateway (like LiteLLM, One-API, or a custom wrapper script conforming to `https://api-docs.deepseek.com/guides/anthropic_api`), this format translation happens automatically.
    
- Ensure your gateway forwards the required headers (`anthropic-beta`, `anthropic-version`), as Claude Code uses them to determine feature flags.
    

#### 2. DeepSeek Model Selection (V3 vs. R1)

- **DeepSeek-V3:** Highly recommended for this specific use case. It natively supports structural tool calling and behaves predictably when choosing when and how to invoke an external tool.
    
- **DeepSeek-R1:** R1 is a reasoning/thinking model. Running R1 through an Anthropic translation layer can sometimes cause issues with tool execution because it emits raw `<thought>` tokens before emitting tool blocks. If Claude Code's parser doesn't expect the chain-of-thought blocks inside a custom gateway endpoint, it might choke on the output. Stick to **DeepSeek-V3** for agentic tool loops unless your proxy explicitly strips or handles reasoning tokens safely.
    

#### 3. Bypassing the Cache Invalidation

Claude Code prepends an attribution header to the system prompt containing versioning fingerprints. Because DeepSeek relies heavily on prompt caching to keep costs low and speeds fast, you should disable this to prevent the cache from busting on every turn.

Add this to your environment variables or target configuration:

Bash

```
export CLAUDE_CODE_ATTRIBUTION_HEADER=0
```

### How to Configure It

Instead of fighting the interactive CLI wizard (`claude mcp add`) which can be brittle when running custom endpoints, you can add the Figma MCP server directly to your global configurations file.

1. Open your Claude Code settings file (typically located at `~/.claude/settings.json` or managed via project scope `.mcp.json`).
    
2. Add your proxy environment details and the Figma server setup into the configuration:
    

JSON

```
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://your-anthropic-deepseek-proxy.com/v1",
    "ANTHROPIC_API_KEY": "your-deepseek-or-proxy-key",
    "ANTHROPIC_MODEL": "deepseek-chat",
    "CLAUDE_CODE_ATTRIBUTION_HEADER": "0"
  },
  "mcpServers": {
    "figma-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-figma"
      ],
      "env": {
        "FIGMA_PAT": "your_figma_personal_access_token"
      }
    }
  }
}
```

When you launch a new session via `claude`, it will instantiate the Figma tools, bind them to the session, and use DeepSeek as the brain to read your design files or generate components.