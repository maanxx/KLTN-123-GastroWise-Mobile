# M6.2.1 CI Integration Automation Report

## 1. Executive Summary
- **Target Repository:** `maanxx/KLTN-123-GastroWise-Mobile`
- **Reference Backend Repository:** `maanxx/KLTN-123-GastroWise-BE` (branch: `fix/m2.3-backend-integration-security`)
- **Objective:** Automate End-to-End API integration testing via GitHub Actions CI to prevent regression between Mobile App, API Gateway (8080), Core Service (3001), Planning Service (3003), and AI Service (5000).
- **Status:** IMPLEMENTED (Local Validation Passed)

## 2. Implemented Components

### 2.1 E2E Test Runner (`scripts/e2e.sh`)
- Generates test JWT authenticating against the backend dev secret.
- Executes automated HTTP curl requests targeting the API Gateway entry point (`http://localhost:8080/api/v1`).
- Validates status codes for core endpoints:
  - `GET /auth/me` (200 OK)
  - `GET /restaurants` (200 OK)
  - `GET /restaurants/weather-recommend` (200 OK)
  - `POST /itineraries/generate` (200 OK)
- Exits with non-zero code upon any failure.

### 2.2 GitHub Actions Workflow (`.github/workflows/e2e-integration.yml`)
- Triggers on push and pull requests targeting `main` and `develop`, and manual trigger (`workflow_dispatch`).
- Checks out both Mobile and Backend repositories.
- Builds backend docker services and starts them with health check polling on `http://localhost:8080/health`.
- Runs `scripts/e2e.sh` against the live stack.
- Collects and uploads Docker logs artifact if any failure occurs.
- Always ensures `docker compose down -v` cleanup.

## 3. Configuration & Isolation
- Isolated test environment with test database in Docker Compose.
- No secrets or `.env` files committed.
