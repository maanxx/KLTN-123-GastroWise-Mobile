#!/usr/bin/env bash
set -euo pipefail

log() { echo "=== $*"; }

# Use provided EXPO_PUBLIC_API_URL or default to localhost gateway
: "${EXPO_PUBLIC_API_URL:=http://localhost:8080/api/v1}"
log "API base URL: $EXPO_PUBLIC_API_URL"

# 1. Register test user to obtain live JWT
RANDOM_SUFFIX=$(date +%s)_$RANDOM
EMAIL="testci_${RANDOM_SUFFIX}@example.com"
USERNAME="user_${RANDOM_SUFFIX}"
log "Registering test user: $EMAIL ($USERNAME)"

REG_PAYLOAD=$(cat <<EOF
{
  "username": "$USERNAME",
  "email": "$EMAIL",
  "password": "Password123!"
}
EOF
)

REG_RES=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d "$REG_PAYLOAD" \
  "$EXPO_PUBLIC_API_URL/auth/register")

HTTP_CODE=$(echo "$REG_RES" | tail -n 1)
BODY=$(echo "$REG_RES" | sed '$d')

if [[ "$HTTP_CODE" -ne 201 && "$HTTP_CODE" -ne 200 ]]; then
  echo "FAIL: User registration returned HTTP $HTTP_CODE: $BODY"
  exit 1
fi

TOKEN=$(node -e '
try {
  const data = JSON.parse(process.argv[1]);
  console.log(data.accessToken || data.token || "");
} catch (e) {
  process.exit(1);
}
' "$BODY")

if [[ -z "$TOKEN" ]]; then
  echo "FAIL: Could not extract accessToken from registration response: $BODY"
  exit 1
fi
log "Successfully obtained JWT token"

request() {
  local method=$1
  local endpoint=$2
  local data=${3:-}
  curl -s -o /dev/null -w "%{http_code}" -X "$method" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    ${data:+-d "$data"} \
    "$EXPO_PUBLIC_API_URL$endpoint"
}

# ---- Test matrix ----
log "A‑01 Profile / Me (expect 200)"
code=$(request GET /auth/profile)
[[ $code -eq 200 ]] || { echo "FAIL A‑01 Profile ($code)"; exit 1; }

log "B‑01 List restaurants (expect 200)"
code=$(request GET /restaurants)
[[ $code -eq 200 ]] || { echo "FAIL B‑01 List ($code)"; exit 1; }

log "C‑01 Weather recommendation (expect 200)"
code=$(request GET /restaurants/weather-recommend)
[[ $code -eq 200 ]] || { echo "FAIL C‑01 Weather ($code)"; exit 1; }

log "E‑01 Generate itinerary (expect 200)"
payload='{"prompt":"Kham pha am thuc Sai Gon","start_time":"09:00","end_time":"18:00","budget":200000,"lat":10.7769,"lng":106.7009}'
code=$(request POST /itineraries/generate "$payload")
[[ $code -eq 200 ]] || { echo "FAIL E‑01 Itinerary ($code)"; exit 1; }

log "All tests passed successfully!"
