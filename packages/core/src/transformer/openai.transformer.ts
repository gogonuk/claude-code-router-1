import { MessageContent, TextContent, UnifiedChatRequest } from "@/types/llm";
import { Transformer } from "@/types/transformer";
import { LLMProvider } from "@/types/llm";

export class OpenAITransformer implements Transformer {
  name = "OpenAI";
  endPoint = "/v1/chat/completions";

  async transformRequestIn(
    request: UnifiedChatRequest,
    _provider: LLMProvider,
    _context: Record<string, any>
  ): Promise<UnifiedChatRequest> {
    if (Array.isArray(request.messages)) {
      request.messages.forEach((msg) => {
        if (Array.isArray(msg.content)) {
          const textParts: string[] = [];
          (msg.content as MessageContent[]).forEach((item) => {
            if (item.type === "text" && (item as TextContent).text) {
              textParts.push((item as TextContent).text!);
            }
            if ((item as TextContent).cache_control) {
              delete (item as TextContent).cache_control;
            }
          });
          msg.content = textParts.join("\n");
        }
        if ((msg as any).cache_control) {
          delete (msg as any).cache_control;
        }
      });
    }
    if (request.reasoning) {
      delete request.reasoning;
    }
    return request;
  }
}