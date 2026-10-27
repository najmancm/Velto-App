# VELTO

VELTO is a task planner with a React/Vite frontend and a Django REST backend. The public landing page does not contain the AI assistant. Registration and sign-in are required before users can see their private task workspace.

## Project structure

```text
frontend/
  src/
	 components/       Auth, landing, and dashboard components
	 features/         Assistant feature UI
	 services/         Session, task, and assistant API clients
	 utils/            Shared frontend helpers
backend/
  planner/            User-owned task model, API, and tests
  velto_backend/      Django settings and project URLs
```

## Requirements

- Node.js 20.19+ or 22.12+
- Python 3.10+
- A browser

SQLite is the local default. MySQL can be selected through backend environment variables.

## Local setup

1. Install frontend packages:

	```powershell
	npm install --prefix frontend
	```

2. Create and activate a backend virtual environment, then install Python dependencies:

	```powershell
	python -m venv backend/.venv
	.\backend\.venv\Scripts\Activate.ps1
	python -m pip install -r backend/requirements.txt
	```

3. Create the local backend environment file and migrate the database:

	```powershell
	Copy-Item backend/.env.example backend/.env
	npm run backend:migrate
	```

4. Start Django in one terminal:

	```powershell
	npm run backend:run
	```

5. Start Vite in a second terminal:

	```powershell
	npm start
	```

Open the local URL printed by Vite. The Vite development server proxies `/api` requests to Django on `127.0.0.1:8000`.

## Environment and AI

The backend reads configuration from `backend/.env`; that file is ignored by Git. Set a long, unique `DJANGO_SECRET_KEY` before deploying. Leave `DJANGO_DEBUG=1` only for local development.

The assistant uses the OpenAI API from Django, never from browser code. Add `OPENAI_API_KEY` to `backend/.env` to enable it and optionally set `OPENAI_MODEL`. Without a key, the authenticated assistant returns a clear configuration error. API-generated tasks are shown for review and only saved after the user confirms.

To use MySQL, install/run MySQL and set `DATABASE_ENGINE=mysql`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, and `DB_PORT` in `backend/.env`, then run migrations.

## Commands

Run from the repository root:

```powershell
npm run build
npm run lint
npm test
npm run backend:check
npm run backend:migrate
```

The root Python scripts use the active Python interpreter. Activate `backend/.venv` first when working locally.

## Current scope

- Account registration, email/password sign-in, session sign-out, and CSRF protection.
- Tasks are owned by the signed-in user and stored in the database.
- Task list, quick add, edit, complete, delete, due date, priority, and filtering.
- Authenticated assistant endpoint with structured task proposals and explicit user approval.
- Password recovery, email verification, Google sign-in, calendar sync, and production deployment are not implemented yet.

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
