# NombaLens System Flow

This document explains how NombaLens works end to end: authentication, AI chat, Lua agent tools, analytics, and payments.

---

## High-Level Architecture

```
┌─────────────┐     WebSocket / REST      ┌──────────────────┐
│   Frontend  │ ───────────────────────▶│  Node.js Backend │
│  (Merchant) │                           │  (Express + IO)  │
└─────────────┘                           └────────┬─────────┘
                                                   │
                    ┌──────────────────────────────┼──────────────────────────────┐
                    │                              │                              │
                    ▼                              ▼                              ▼
            ┌───────────────┐              ┌───────────────┐              ┌───────────────┐
            │  PostgreSQL   │              │   Lua Agent   │              │  Nomba APIs   │
            │  (Prisma)     │              │  (Lua Cloud)  │              │  (Payments)   │
            └───────────────┘              └───────┬───────┘              └───────────────┘
                                                   │
                                                   │ Tool calls (internal API key)
                                                   ▼
                                           ┌───────────────┐
                                           │ NombaLens     │
                                           │ Analytics API │
                                           └───────────────┘
```

NombaLens is a financial copilot for merchants. The backend stores transaction data, exposes analytics APIs, and forwards merchant chat messages to a Lua AI agent. The agent answers using real business data fetched through tools — it never invents financial numbers.

---

## 1. Merchant Authentication Flow

Merchants authenticate with **phone + PIN**. The backend issues JWT access and refresh tokens.

### Register

```
POST /api/v1/auth/register
{
  "businessName": "Ada Stores",
  "phone": "08012345678",
  "subAccountId": "nomba-sub-account-id",
  "pin": "1234"
}
```

**What happens:**

1. Phone is normalized and validated.
2. PIN is hashed with scrypt and stored on the merchant record.
3. Merchant is created (including Nomba virtual account setup when configured).
4. Access token (1h) and refresh token (30d) are issued.
5. Refresh token is stored hashed in the `RefreshToken` table.

### Login

```
POST /api/v1/auth/login
{
  "phone": "08012345678",
  "pin": "1234"
}
```

**What happens:**

1. Rate limit is checked (5 attempts per phone per 15 minutes).
2. Phone and PIN are verified against the database.
3. New access + refresh tokens are returned.

### Token usage

| Token | Header | Used for |
|-------|--------|----------|
| Access token | `Authorization: Bearer <accessToken>` | REST APIs, WebSocket auth |
| Refresh token | Body on `/auth/refresh` | Rotating expired access tokens |

### Other auth endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/auth/refresh` | Issue new token pair |
| `POST` | `/api/v1/auth/logout` | Revoke refresh token |
| `GET` | `/api/v1/auth/me` | Get authenticated merchant profile |

After login, `req.user.merchantId` is available on all protected routes. Merchants never need to pass their own merchant ID in the URL for user-facing endpoints.

---

## 2. AI Chat Flow

Merchants chat with NombaLens AI over WebSocket. The AI is powered by Lua and uses real merchant data via tools.

### Connection

```typescript
import { io } from "socket.io-client";

const socket = io("https://nombalens-backend.onrender.com", {
  path: "/api/v1/ai/chat",
  auth: { token: accessToken },
});
```

### Message flow

```
Merchant                Backend                  Lua Agent              Analytics API
   │                       │                         │                        │
   │── connect (JWT) ─────▶│                         │                        │
   │◀── connected ─────────│                         │                        │
   │                       │                         │                        │
   │── emit "ai" ─────────▶│                         │                        │
   │   { message }         │── save user message ──▶ PostgreSQL               │
   │                       │── POST /chat/stream ──▶│                        │
   │                       │   + merchantId context  │── tool call ──────────▶│
   │                       │                         │◀── real data ──────────│
   │                       │◀── streamed response ───│                        │
   │                       │── save assistant msg ─▶ PostgreSQL               │
   │◀── emit "ai" ─────────│                         │                        │
   │   { content }         │                         │                        │
```

### Socket events

**Client → Server**

```json
{ "message": "How is my business doing?" }
```

**Server → Client (success)**

```json
{ "content": "Your weekly revenue is ₦240,000..." }
```

**Server → Client (error)**

```json
{ "message": "Unable to process request." }
```

### Context sent to Lua

Every AI request includes merchant context so tools know whose data to fetch:

```json
{
  "merchantId": "<from JWT>",
  "channel": "web",
  "timestamp": "2026-07-02T12:00:00.000Z"
}
```

This is passed as `runtimeContext` to the Lua HTTP API. The merchant ID always comes from authentication — the AI never asks the merchant for it.

### Safeguards

- **Rate limiting:** 10 messages per minute per merchant
- **Conversation storage:** All messages saved in `AiConversation`
- **Logging:** `merchantId`, message, tools used, response time
- **No fabricated data:** The agent persona instructs Lua to only use tool results

### Chat history (REST)

```
GET /api/v1/ai/history?limit=50
Authorization: Bearer <accessToken>
```

Returns the authenticated merchant's stored conversation messages.

---

## 3. Lua Agent & Tools Flow

The Lua agent (`lua-agent/`) runs on Lua Cloud. It has a `finance-assistant` skill with four tools.

### Tools

| Tool | Backend endpoint | Purpose |
|------|------------------|---------|
| `get_revenue_summary` | `GET /analytics/:merchantId/summary` | Today, weekly, monthly revenue + growth |
| `get_business_health` | `GET /analytics/:merchantId/health` | Health score and performance |
| `get_insights` | `GET /insights/:merchantId` | Business recommendations and trends |
| `create_payment_link` | `POST /payments/link` | Create a Nomba payment link |

### Tool execution flow

```
Merchant asks question
        │
        ▼
Lua Agent decides which tool to call
        │
        ▼
Tool sends HTTP request to NombaLens backend
  - Header: X-Internal-Api-Key
  - URL: NOMBALENS_BACKEND_URL + /api/v1/analytics/:merchantId/...
        │
        ▼
Backend validates internal API key
        │
        ▼
Analytics service queries PostgreSQL (Transaction table)
        │
        ▼
Real data returned to Lua Agent
        │
        ▼
Agent generates natural-language response
```

The agent never generates revenue, growth, or health numbers without calling a tool first.

### Lua agent environment

```bash
NOMBALENS_BACKEND_URL=https://nombalens-backend.onrender.com
INTERNAL_API_KEY=your-shared-secret   # Must match backend INTERNAL_API_KEY
```

Deploy with:

```bash
cd lua-agent
lua push --auto-deploy
```

---

## 4. Analytics & Insights Access

There are two ways to access analytics and insights APIs.

### Merchant-facing (JWT)

Merchants use their access token. The merchant ID comes from the JWT — not from the URL.

| Method | Path |
|--------|------|
| `GET` | `/api/v1/analytics/summary` |
| `GET` | `/api/v1/analytics/health` |
| `GET` | `/api/v1/analytics/weekly` |
| `GET` | `/api/v1/insights` |
| `POST` | `/api/v1/insights/generate` |

### Internal / Lua agent (API key)

Lua tools call legacy paths with an explicit merchant ID and internal API key.

| Method | Path | Header |
|--------|------|--------|
| `GET` | `/api/v1/analytics/:merchantId/summary` | `X-Internal-Api-Key` |
| `GET` | `/api/v1/analytics/:merchantId/health` | `X-Internal-Api-Key` |
| `GET` | `/api/v1/analytics/:merchantId/weekly` | `X-Internal-Api-Key` |
| `GET` | `/api/v1/insights/:merchantId` | `X-Internal-Api-Key` |
| `POST` | `/api/v1/insights/:merchantId/generate` | `X-Internal-Api-Key` |

### Analytics data source

All analytics read from the `Transaction` table, populated by Nomba webhooks when payments succeed.

**Revenue summary** returns:

```json
{
  "todayRevenue": 50000,
  "weeklyRevenue": 240000,
  "monthlyRevenue": 900000,
  "growth": 18,
  "totalTransactions": 42
}
```

**Business health** returns:

```json
{
  "score": "Good",
  "growth": 18,
  "weeklyRevenue": 240000
}
```

Health scoring:

| Growth | Score |
|--------|-------|
| > 20% | Excellent |
| > 10% | Good |
| > 0% | Average |
| ≤ 0% | Poor |

---

## 5. Payment & Transaction Flow

### Merchant onboarding

```
POST /api/v1/auth/register   (app sign-up with PIN)
        or
POST /api/v1/merchants       (admin/onboarding without PIN)
```

Creates a merchant record and optionally provisions a Nomba virtual account.

### Payment webhook

```
Nomba ──POST /api/v1/webhooks/nomba──▶ Backend
```

When a `payment_success` event arrives:

1. Webhook signature is verified.
2. Transaction is saved to PostgreSQL.
3. Analytics and insights become available for that merchant.

### Payment links

```
POST /api/v1/payments/link
```

Creates a Nomba payment link. Used by the `create_payment_link` Lua tool when a merchant asks the AI to generate a payment link.

---

## 6. Database Models (Key Tables)

| Model | Purpose |
|-------|---------|
| `Merchant` | Business profile, phone, PIN hash, virtual account details |
| `Transaction` | Payment records from Nomba webhooks |
| `Insight` | Rule-generated business insights |
| `AiConversation` | Chat message history (user + assistant) |
| `RefreshToken` | Hashed refresh tokens for auth rotation |
| `Customer` | Customer payment aggregates (future use) |

---

## 7. Environment Variables

### Backend (`.env`)

```bash
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=optional-separate-secret
INTERNAL_API_KEY=your-shared-secret
LUA_API_KEY=your-lua-api-key
LUA_AGENT_ID=nombalens
LUA_API_BASE_URL=https://api.heylua.ai
NOMBA_BASE_URL=https://api.nomba.com
NOMBA_CLIENT_ID=...
NOMBA_CLIENT_SECRET=...
NOMBA_ACCOUNT_ID=...
NOMBA_SECRET_KEY=...
PORT=5000
```

### Lua agent (`lua-agent/.env`)

```bash
NOMBALENS_BACKEND_URL=https://nombalens-backend.onrender.com
INTERNAL_API_KEY=your-shared-secret
```

`INTERNAL_API_KEY` must be the same value on both the backend and the Lua agent.

---

## 8. Local Development

### Start the backend

```bash
npm install
npm run prisma:deploy    # apply migrations
npm run dev              # starts server on port 5000
```

### Test with Postman

1. Import `nombalens.postman_collection.json` and `nombalens.postman_environment.json`.
2. Run **Auth → Register** or **Login** (saves `accessToken` automatically).
3. Run **Analytics → Summary (Authenticated)** or connect to AI chat via WebSocket.

### Deploy the Lua agent

```bash
cd lua-agent
lua env production -k INTERNAL_API_KEY -v your-shared-secret
lua env production -k NOMBALENS_BACKEND_URL -v https://nombalens-backend.onrender.com
lua push --auto-deploy
lua chat -e production -m "How is my business doing?" -t test
```

---

## 9. Future: WhatsApp Integration

The architecture supports multiple channels through the same AI service:

```
WhatsApp message
        │
        ▼
Webhook receives message
        │
        ▼
Lookup merchant by phone number
        │
        ▼
aiService.chat(merchant.id, message)
        │
        ▼
Same Lua agent + tools flow
```

One Lua agent serves all merchants. Each request is scoped by `merchantId`, so merchants only ever see their own data.

---

## Quick Reference

| Concern | Where it lives |
|---------|----------------|
| Auth | `src/modules/auth/` |
| AI chat | `src/modules/ai/` |
| Analytics | `src/modules/analytics/` |
| Insights | `src/modules/insights/` |
| Lua tools | `lua-agent/src/tools/` |
| Webhooks | `src/modules/webhooks/` |
| Postman collection | `nombalens.postman_collection.json` |
