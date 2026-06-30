#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${NOMBA_SECRET_KEY:-}" ]]; then
  echo "NOMBA_SECRET_KEY is not set"
  exit 1
fi

TIMESTAMP="$(date +%s)"
EVENT="payment_success"
REQUEST_ID="req-123"
USER_ID="u1"
WALLET_ID="w1"
TXN_ID="txn-123"
TXN_TYPE="credit"
TXN_TIME="2026-06-30T12:00:00.000Z"
TXN_RESPONSE_CODE=""

STRING_TO_SIGN="${EVENT}:${REQUEST_ID}:${USER_ID}:${WALLET_ID}:${TXN_ID}:${TXN_TYPE}:${TXN_TIME}:${TXN_RESPONSE_CODE}:${TIMESTAMP}"

SIG="$(printf '%s' "$STRING_TO_SIGN" | openssl dgst -sha256 -hmac "$NOMBA_SECRET_KEY" -binary | base64)"

echo "timestamp: $TIMESTAMP"
echo "signature: $SIG"

curl -i -X POST http://localhost:5000/api/v1/webhooks/nomba \
  -H "Content-Type: application/json" \
  -H "nomba-timestamp: $TIMESTAMP" \
  -H "nomba-signature: $SIG" \
  -d '{
    "event_type": "payment_success",
    "requestId": "req-123",
    "data": {
      "transaction": {
        "transactionId": "txn-123",
        "aliasAccountReference": "merchant-1",
        "accountNumber": "1234567890",
        "transactionAmount": "1000",
        "type": "credit",
        "responseCode": "",
        "time": "2026-06-30T12:00:00.000Z",
        "narration": "Test payment"
      },
      "merchant": {
        "userId": "u1",
        "walletId": "w1"
      },
      "customer": {
        "senderName": "Test User"
      }
    }
  }'