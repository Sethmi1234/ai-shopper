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
| `ai:message` | `{ message: string, conversationHistory?: { role: "user" \| "assistant", content: string }[] }` | Sends a user chat message for a streamed AI response. |

## Server to Client

| Event | Payload | Description |
| --- | --- | --- |
| `ai:start` | none | The server accepted the message and streaming is starting. |
| `ai:chunk` | `{ text: string }` | One streamed AI text chunk. Append it to the current assistant message. |
| `ai:done` | `{ reply: string, products: Product[] }` | Streaming finished. Includes the final reply and product cards. |
| `ai:error` | `{ message: string, retryAfterSeconds?: number }` | Validation, auth, rate-limit, or AI provider failure. |

All AI response events are emitted with `socket.emit()` to the requesting socket only.
