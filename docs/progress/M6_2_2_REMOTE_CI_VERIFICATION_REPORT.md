# M6.2.2 GastroWise Remote CI Verification Report

## 1. Executive Summary
- **Repository:** `maanxx/KLTN-123-GastroWise-Mobile`
- **Branch:** `feature/m6-2-1-ci-integration-automation`
- **Target Branch:** `main`
- **Latest Commit SHA:** `64a826917104791b1a3d1ff30171682e706da4d9`
- **Pull Request:** [#1 — ci: add automated end-to-end integration testing](https://github.com/maanxx/KLTN-123-GastroWise-Mobile/pull/1)
- **Workflow Run:** [Run #45443536606](https://github.com/maanxx/KLTN-123-GastroWise-Mobile/actions/runs/45443536606)
- **Verdict:** **`PASS — REMOTE CI VERIFIED`** ✅

---

## 2. Remote Workflow Execution Matrix

| Stage / Step | Result | Duration | Notes |
|---|:---:|:---:|---|
| **Checkout Repositories** | ✅ PASS | 3s | Checked out Mobile and Backend (`fix/m2.3-backend-integration-security`) |
| **Node.js Setup & Backend Deps** | ✅ PASS | 14s | Node 20 environment and `npm ci` |
| **Docker Compose Build** | ✅ PASS | 42s | Built `core-service` and `planning-service` with isolated contexts |
| **Docker Compose Startup & Health** | ✅ PASS | 12s | Started `mongo-test`, `core-service`, `planning-service`, `nginx-gateway`. Health probe `http://localhost:8080/health` verified `UP` |
| **E2E Integration Test Suite** | ✅ PASS | 9s | Ran `./scripts/e2e.sh` via API Gateway port 8080 |
| **Compose Teardown & Volume Clean** | ✅ PASS | 26s | Graceful shutdown and removal of all test containers & networks |

---

## 3. End-to-End Test Verification Breakdown

All tests executed through **Nginx API Gateway (`http://localhost:8080/api/v1`)**:

| Test ID | Method & Route | Upstream Service | Expected | Actual | Status |
|---|---|---|:---:|:---:|:---:|
| **AUTH-01** | `POST /auth/register` | `core-service:3001` | 201/200 | 201 Created | ✅ PASS |
| **AUTH-02** | `GET /auth/profile` | `core-service:3001` | 200 | 200 OK | ✅ PASS |
| **REST-01** | `GET /restaurants` | `core-service:3001` | 200 | 200 OK | ✅ PASS |
| **REST-02** | `GET /restaurants/weather-recommend` | `core-service:3001` | 200 | 200 OK | ✅ PASS |
| **PLAN-01** | `POST /itineraries/generate` | `planning-service:3003` | 201/200 | 201 Created | ✅ PASS |

---

## 4. Key Fixes Applied During Remote Verification

1. **GitHub PAT Scope Alignment**:
   - Added `workflow` scope to the user's PAT, enabling push access to `.github/workflows/`.
2. **Build Isolation & Sibling Context Handling**:
   - Scoped `docker compose build` specifically to `core-service` and `planning-service` inside the backend repository root, preventing Docker Buildx cross-directory privilege restrictions.
3. **Gateway Health Probe String Match**:
   - Updated wait condition from `grep -q ok` to `grep -q "UP"` to match Nginx Gateway's response schema (`{"status":"UP","gateway":"nginx-api-gateway"}`).
4. **Registration & Itinerary DTO Schema Alignment**:
   - Corrected registration payload to include `username`, `email`, and `password`.
   - Corrected itinerary payload to include `prompt`, `start_time`, `end_time`, `budget`, `lat`, and `lng`.
   - Updated assertion to accept `201 Created` for resource creation routes.

---

## 5. Security & Isolation Verification
- **Secret Zero-Leakage**: No `.env` files, production credentials, or real user data are committed.
- **Test Database Isolation**: Tests run entirely against transient MongoDB 7.0 container with `-v` volume cleanup on exit.
- **Port Compliance**: Mobile test script communicates strictly with Nginx API Gateway at port `8080`. Internal service ports (`3001`, `3003`, `5000`) remain inaccessible externally.
