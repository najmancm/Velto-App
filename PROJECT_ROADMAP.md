# VELTO Product Roadmap

## Current audit

- **Stack:** React 19 + Vite 8 frontend; Django 5.2 + Django REST Framework backend.
- **Structure:** `frontend/src/components` for UI, `frontend/src/features` for product features, `frontend/src/services` for API access, and `backend/planner` for task APIs/models/tests.
- **Storage:** SQLite is the development default. MySQL is selectable via environment variables but has not been configured against a running MySQL server.
- **Authentication:** Django registration, email/password sign-in, session restoration, sign-out, password hashing, and CSRF protection are implemented.
- **Tasks:** Authenticated, user-owned CRUD, bulk creation, priorities, due dates, completion, and filtering are implemented through the API.
- **Assistant:** Authenticated server-side OpenAI endpoint returns proposed tasks for user approval. It requires `OPENAI_API_KEY` for open-ended AI chat. Without a key, explicit comma- or line-separated task lists use a clearly labeled local parser; other prompts explain the missing key.
- **Public home:** Has no AI features or assistant UI; it contains one non-AI sample task card and sign-in/register entry points.
- **Not yet implemented:** Password recovery, email verification, Google sign-in, MySQL deployment, calendar sync, and production hosting.

## Checklist

### Phase 1 — Audit and stabilize
- [x] Inspect project structure, dependencies, scripts, and existing interactions.
- [x] Confirm demo behavior is not presented as real AI or authentication.
- [x] Run build and lint; fix any regressions.

### Phase 2 — Complete the web interface
- [x] Separate the public landing page from authenticated application UI.
- [x] Add a footer and preserve responsive landing page behavior.
- [x] Add real registration/sign-in and gate the dashboard behind a server session.
- [ ] Build onboarding and add Goals, Projects, Calendar, and Settings views.

### Phase 3 — Functional frontend behavior
- [x] Store tasks in Django and scope all task queries to the authenticated owner.
- [x] Add task create, view, edit, delete, completion, and bulk-creation controls.
- [x] Add due dates, priorities, Inbox/Today/Upcoming/Completed filters, and search.
- [x] Require user approval before saving assistant-proposed tasks.
- [ ] Add goal/project management and task organization by goal/project.
- [x] Add tests for registration, password hashing, CSRF, task ownership, bulk creation, and AI configuration behavior.

### Phase 4 — Django backend
- [x] Create Django + Django REST Framework backend with SQLite development settings and MySQL configuration.
- [x] Add validated task models, migrations, API endpoints, authorization, and tests.

### Phase 5 — Connect the frontend
- [x] Add a session-aware API client with CSRF, loading, and error states.
- [x] Persist user-specific tasks through authorized API endpoints.

### Phase 6 — Real AI planning
- [x] Generate validated structured task proposals through the backend when configured.
- [x] Add review-before-save, request limits, and provider error handling.
- [x] Keep AI credentials server-side; return a configuration message until a key is set.

### Phase 7 — Authentication and cloud data
- [x] Add secure registration, login, sign-out, and account-specific task data.
- [ ] Add password recovery and email verification.
- [ ] Add optional Google sign-in and user preferences.

### Phase 8 — Mobile and production
- [ ] Build an Expo/React Native client against the shared backend.
- [ ] Add notifications and prepare secure web/mobile deployment.
- [ ] Design for future subscriptions without adding fake payments.
