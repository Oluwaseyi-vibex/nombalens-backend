export interface AiChatContext {
  merchantId: string;
  channel: "web";
  timestamp: string;
}

export interface ClientAiMessage {
  message: string;
}

export interface ServerAiContentResponse {
  content: string;
}

export interface ServerAiErrorResponse {
  message: string;
}

export type ServerAiResponse = ServerAiContentResponse | ServerAiErrorResponse;

export interface LuaStreamChunk {
  type?: string;
  textDelta?: string;
  text?: string;
  finishReason?: string;
  toolCalls?: Array<{ toolName?: string; name?: string }>;
  toolsUsed?: string[];
}

export interface LuaGenerateResponse {
  text?: string;
  toolCalls?: Array<{ toolName?: string; name?: string }>;
  toolsUsed?: string[];
}

export interface ChatResult {
  content: string;
  toolsUsed: string[];
  responseTimeMs: number;
}

export interface ConversationMessage {
  id: string;
  role: string;
  message: string;
  createdAt: Date;
}
