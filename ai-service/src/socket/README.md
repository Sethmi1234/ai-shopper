# WebSocket AI Chat API

Socket.IO runs on the same backend port as Express. Clients authenticate during the handshake with the same JWT used for REST routes:

```ts
io(API_URL, {
  auth: { token: accessToken },
  withCredentials: true,
});
```

## Client to Server

| Event | Payload | Description |
| --- | --- | --- |
| `ai:message` | `{ message: string, conversationHistory?: { role: "user" \| "assistant", content: string }[], sessionId?: string }` | Sends a user chat message for a streamed AI response. |
| `ai:loadHistory` | `{ sessionId: string }` | Loads conversation history from MongoDB for continuing a previous conversation. |
| `ai:newConversation` | none | Clears socket memory to start a fresh conversation. |
| `ai:getSuggestions` | none | Requests contextual suggested questions based on current conversation state. |

## Server to Client

| Event | Payload | Description |
| --- | --- | --- |
| `ai:start` | none | The server accepted the message and streaming is starting. |
| `ai:typing` | `{ isTyping: boolean }` | Indicates whether the AI is currently typing (typing indicator). |
| `ai:chunk` | `{ text: string }` | One streamed AI text chunk. Append it to the current assistant message. |
| `ai:done` | `{ reply: string, products: Product[], suggestions: string[], sessionId: string }` | Streaming finished. Includes the final reply, product cards, suggested questions, and session ID. |
| `ai:suggestions` | `{ suggestions: string[] }` | Contextual suggested questions for the user to ask. |
| `ai:historyLoaded` | `{ sessionId: string, messages: { role: "user" \| "assistant", content: string }[], messageCount: number }` | Previous conversation history loaded successfully. |
| `ai:conversationCleared` | none | Socket memory cleared for a new conversation. |
| `ai:error` | `{ message: string, retryAfterSeconds?: number }` | Validation, auth, rate-limit, or AI provider failure. |

All AI response events are emitted with `socket.emit()` to the requesting socket only.

## Features

- **Streaming Responses**: Real-time token-by-token AI responses via `ai:chunk` events
- **Typing Indicators**: `ai:typing` events show when AI is generating responses
- **Conversation Memory**: In-memory session storage for active socket connections (last 15 messages)
- **Persistent History**: MongoDB-based chat history with session tracking
- **Intent Classification**: AI-powered intent detection (greeting, product_search, recommendation, etc.)
- **Contextual Suggestions**: Smart suggested questions based on conversation context
- **Error Handling**: Graceful fallbacks for AI service failures
- **Rate Limiting**: Per-user rate limiting to prevent abuse
