# GASTROWISE MOBILE APPLICATION - ARCHITECTURE & IMPLEMENTATION ROADMAP

**Version:** 1.0.0 (Production-Ready)  
**Stack:** React Native (Expo SDK 57, Expo Router 57), TypeScript 6.0, Zustand 5, Axios, Lucide Icons  
**Target Ecosystem:** GastroWise Food Experience Information System  
**Backend:** Node.js / NestJS (Port 3001), MongoDB Atlas, Python FastAPI AI Microservice (Port 5000)  

---

## 1. Executive Summary & Architecture Overview

The GastroWise Mobile Application provides a smart, AI-driven dining and culinary journey experience for diners in Vietnam. It integrates with the NestJS backend and local AI services to deliver automated food tour routing, weather-adaptive meal recommendations, review sentiment analysis, and taste personalization.

```
                    ┌────────────────────────────────────────────────────────┐
                    │               GastroWise Mobile App                   │
                    │         (React Native / Expo Router SDK 57)            │
                    └──────────────────────────┬─────────────────────────────┘
                                               │
                         HTTP / REST API (JWT Bearer Auth)
                                               │
                                               ▼
                    ┌────────────────────────────────────────────────────────┐
                    │               NestJS Backend Gateway                   │
                    │                    (Port 3001)                         │
                    └───────────┬───────────────────────────────┬────────────┘
                                │                               │
                     MongoDB Atlas (Database)       FastAPI Python Microservice (Port 5000)
                     - restaurants, users            - AI Sentiment Analysis
                     - itineraries, reviews          - Itinerary & Image Recognition
                     - favorites, menu
```

---

## 2. Comprehensive Module Status & Feature Audit

| Module | Feature / Screen | File Path | Status | Verification & Integration Status |
| :--- | :--- | :--- | :---: | :--- |
| **M1: Auth & Profile** | Login Screen | `src/app/(auth)/login.tsx` | **COMPLETED** | Verified: handles both `res.token` and `res.accessToken`, persists session in `expo-secure-store`. |
| **M1: Auth & Profile** | Register Screen | `src/app/(auth)/register.tsx` | **COMPLETED** | Verified: auto-authenticates user upon successful registration. |
| **M1: Auth & Profile** | Forgot Password & OTP | `src/app/(auth)/forgot-password.tsx` | **COMPLETED** | Verified: multi-step OTP reset flow implemented. |
| **M1: Auth & Profile** | Profile & Settings | `src/app/(tabs)/profile.tsx` | **COMPLETED** | Verified: session display, role badge, navigation shortcuts. |
| **M1: Auth & Profile** | Edit Profile | `src/app/profile/edit.tsx` | **COMPLETED** | Verified: calls `PATCH /auth/profile`, syncs name & phone to SecureStore. |
| **M1: Auth & Profile** | Two-Factor Auth (2FA) | `src/app/profile/two-factor.tsx` | **COMPLETED** | Verified: QR & TOTP verification UI. |
| **M2: Food Discovery** | Home Screen | `src/app/(tabs)/index.tsx` | **COMPLETED** | Verified: dynamic weather banner, cuisine categories, featured restaurants. |
| **M2: Food Discovery** | Category Filter Navigation | `src/app/(tabs)/index.tsx` | **COMPLETED** | Verified: category pills link directly to Explore with active query filter. |
| **M2: Food Discovery** | Explore Screen | `src/app/(tabs)/explore.tsx` | **COMPLETED** | Verified: real-time text search, rating filter, and restaurant list. |
| **M3: Restaurant & Location** | Restaurant Details | `src/app/restaurant/[id].tsx` | **COMPLETED** | Verified: phone call, Google Maps directions, categorized menu, AI sentiment summary. |
| **M3: Restaurant & Location** | Online Booking | `src/app/restaurant/booking/[id].tsx` | **COMPLETED** | Verified: booking submission form connects to itineraries workflow. |
| **M4: Food Preferences** | Taste DNA & Collections | `src/app/favorites.tsx` | **COMPLETED** | Verified: custom folder collections, progress bars, and live data. |
| **M4: Food Preferences** | Taste Preference Modal | `src/app/favorites.tsx` | **COMPLETED** | Verified: questionnaire for dietary constraints, spice tolerance, preferred cuisines persisted to `PATCH /auth/profile`. |
| **M5: Smart Food Journey** | AI Tour Planner | `src/app/ai-planner.tsx` | **COMPLETED** | Verified: budget, time slot, location, prompt selection -> `POST /itineraries/generate`. |
| **M5: Smart Food Journey** | Itinerary List | `src/app/(tabs)/itineraries.tsx` | **COMPLETED** | Verified: list of saved journeys, pull-to-refresh, stop summaries. |
| **M5: Smart Food Journey** | Itinerary Detail & Map | `src/app/itinerary/[id].tsx` | **COMPLETED** | Verified: route timeline, Google Maps navigation, CO₂ saved, native share, status pill, complete & delete actions. |
| **M6: Reviews & Community** | Write Review Screen | `src/app/restaurant/review/[id].tsx` | **COMPLETED** | Verified: payload sends `{ restaurantId, diemReview, noiDung, userName, userId }` to `POST /reviews`. |
| **M6: Reviews & Community** | Favorites Sync | `src/app/favorites.tsx` | **COMPLETED** | Verified: connected to `GET /favorites` and `POST /favorites/toggle`. |
| **M7: Notifications** | In-App Notification Center | `src/app/notifications.tsx` | **COMPLETED** | Verified: notification list with filter tabs (Tất cả / Chưa đọc), mark all read, clear, linked to Bell icon. |
| **M8: UI/UX & Quality** | Design System Tokens | `src/constants/index.ts` | **COMPLETED** | Verified: full Tailwind scale (50-950) configured with `ColorScale`. TypeScript checks pass with **0 errors**. |

---

## 3. Backend API Contract Mapping

| Frontend Need | Backend Endpoint | Method | Auth Required | Status |
| :--- | :--- | :---: | :---: | :--- |
| Login | `/auth/login` | POST | No | Contract verified: returns `{ token, user }` |
| Register | `/auth/register` | POST | No | Contract verified: returns `{ token, user }` |
| Update Profile | `/auth/profile` | PATCH | Yes | Contract verified: accepts `UpdateUserDto` (name, phone, preferences) |
| Get Restaurants | `/restaurants` | GET | No | Contract verified: returns paginated restaurants |
| Weather Recommendation | `/restaurants/weather-recommend` | GET | No | Contract verified: returns weather and meal suggestions |
| Restaurant Detail | `/restaurants/:id` | GET | No | Contract verified: returns restaurant with full fields |
| Restaurant Menu | `/restaurants/:id/menu` | GET | No | Contract verified: returns items for restaurant |
| AI Chat Copilot | `/restaurants/chat` | POST | No | Contract verified: returns `{ reply, data }` |
| Generate Itinerary | `/itineraries/generate` | POST | Yes | Contract verified: returns generated itinerary with stops & CO₂ |
| User Itineraries | `/itineraries` | GET | Yes | Contract verified: returns array of user itineraries |
| Itinerary Detail | `/itineraries/:id` | GET | Yes | Contract verified: returns populated stops |
| Update Itinerary Status | `/itineraries/:id` | PATCH | Yes | Contract verified: updates status (`completed`, `cancelled`) |
| Delete Itinerary | `/itineraries/:id` | DELETE | No/Admin | Contract verified: removes itinerary document |
| Submit Review | `/reviews` | POST | No/Yes | Contract verified: expects `{ restaurantId, diemReview, noiDung }` |
| User Favorites | `/favorites` | GET | Yes | Contract verified: returns saved restaurant list |
| Toggle Favorite | `/favorites/toggle` | POST | Yes | Contract verified: accepts `{ restaurant_id }` |

---

## 4. Completed Implementation Tasks

- [x] **Task M-1: Fix API Base URL & Auth Storage Contracts**
  - Updated `src/constants/index.ts` to support Android emulator (`10.0.2.2:3001`), iOS/web (`localhost:3001`), and removed invalid `/api/v1` prefix.
  - Fixed `authStore.ts` to handle both `res.token` and `res.accessToken`.
  - Fixed `profile/edit.tsx` to call `PATCH /auth/profile`.

- [x] **Task M-2: Fix Review Submission API Contract**
  - Updated `src/app/restaurant/review/[id].tsx` to submit `{ restaurantId, diemReview, noiDung, userName, userId }`.
  - Displayed actual AI sentiment feedback from the backend response.

- [x] **Task M-3: Complete Smart Food Journey Actions (Lifecycle Management)**
  - In `src/app/itinerary/[id].tsx`, added options to complete journey (`PATCH /itineraries/:id`) and delete journey (`DELETE /itineraries/:id`).
  - Added visual status pill: `Đã hoàn thành`, `Đã xác nhận`, `Đang lên kế hoạch`.

- [x] **Task M-4: Implement Taste DNA & Personalized Food Preferences Questionnaire**
  - Created interactive Food Preference modal in `src/app/favorites.tsx` to let users customize favorite cuisines, spice tolerance, and dietary restrictions.
  - Persisted preferences to user profile via `PATCH /auth/profile`.

- [x] **Task M-5: Connect Live Favorites to Backend (`/favorites`)**
  - Connected `favorites.tsx` to real `GET /favorites` and `POST /favorites/toggle`.

- [x] **Task M-6: Connect AI Assistant to Real Backend Chat API**
  - In `src/app/ai-assistant.tsx`, connected to real `POST /restaurants/chat` returning live restaurant recommendations.

- [x] **Task M-7: Implement In-App Notifications Screen & Bell Linkage**
  - Created `src/app/notifications.tsx` with notification filters, read/unread states, and clear options.
  - Linked Bell icon in `HomeScreen` to `/notifications`.

- [x] **Task M-8: Category Navigation in Home Screen**
  - Linked category pills in `HomeScreen` to route to `/(tabs)/explore` with category query.

---

## 5. Verification & Acceptance Criteria

1. **TypeScript Health:** `npx tsc --noEmit` -> **PASSED WITH 0 ERRORS**.
2. **Real Data Persistence:** No mock fallbacks used when authenticated against backend port 3001.
3. **Responsive UI/UX:** Safe area padding on all screens for iOS notch and Android gesture bars.
4. **Resilience:** Graceful offline/loading indicators and error alerts.
