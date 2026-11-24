#!/usr/bin/env bash
set -euo pipefail

log() { echo "=== $*"; }

# Use provided EXPO_PUBLIC_API_URL or default to localhost gateway
: "${EXPO_PUBLIC_API_URL:=http://localhost:8080/api/v1}"
log "API base URL: $EXPO_PUBLIC_API_URL"

# Generate a test JWT using the default test secret (backend uses this secret in dev)
JWT_SECRET=${JWT_SECRET:-test_jwt_secret_32_characters_long_for_m22}
TOKEN=$(node - <<'EOF'
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;
const payload = { userId: 'test_user', email: 'test@example.com', role: 'user' };
console.log(jwt.sign(payload, secret, { expiresIn: '1h' }));
EOF
)
log "Generated test JWT"

request() {
  local method=$1
  local endpoint=$2
  local data=$3
  curl -s -o /dev/null -w "%{http_code}" -X "$method" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    ${data:+-d "$data"} \
    "$EXPO_PUBLIC_API_URL$endpoint"
}

# ---- Test matrix ----
log "A‑03 Me (expect 200)"
code=$(request GET /auth/me)
[[ $code -eq 200 ]] || { echo "FAIL A‑03 Me ($code)"; exit 1; }

log "B‑01 List restaurants (expect 200)"
code=$(request GET /restaurants)
[[ $code -eq 200 ]] || { echo "FAIL B‑01 List ($code)"; exit 1; }

log "C‑01 Weather recommendation (expect 200)"
code=$(request GET /restaurants/weather-recommend)
[[ $code -eq 200 ]] || { echo "FAIL C‑01 Weather ($code)"; exit 1; }

log "E‑01 Generate itinerary (expect 200)"
payload='{"preferences":["vegan"],"timeRange":"2023-01-01T08:00/2023-01-01T18:00","budget":200000}'
code=$(request POST /itineraries/generate "$payload")
[[ $code -eq 200 ]] || { echo "FAIL E‑01 Itinerary ($code)"; exit 1; }

log "All tests passed"
