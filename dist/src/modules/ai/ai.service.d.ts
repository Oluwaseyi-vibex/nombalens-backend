import type { ChatResult, ConversationMessage } from "./ai.types.js";
export declare const chat: (merchantId: string, message: string) => Promise<ChatResult>;
export declare const getConversationHistory: (merchantId: string, limit?: number) => Promise<ConversationMessage[]>;
//# sourceMappingURL=ai.service.d.ts.map