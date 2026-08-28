# DukaSync

DukaSync is an inventory and restocking API for small retail shops.

## Backend Setup

From the repository root, create and activate a virtual environment, then install the backend dependencies:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
```

Copy `.env.example` to `.env` and update the values for your PostgreSQL instance:

```powershell
Copy-Item .env.example .env
```

Required environment variables:

```dotenv
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/dukasync
WEBHOOK_SECRET=replace-with-a-long-random-secret
```

Keep `.env` private. It is excluded from version control.

## Database Migrations

The project uses Alembic, with migration scripts in `backend/alembic/` and configuration in the root `alembic.ini`. After configuring `.env`, run migrations from the repository root:

```powershell
alembic upgrade head
```

The initial migration creates the `Shop`, `Product`, `Sale`, `Supplier`, and `RestockOrder` tables:

```powershell
alembic current
alembic history
```

To create a migration after changing the SQLAlchemy models:

```powershell
alembic revision --autogenerate -m "describe the schema change"
alembic upgrade head
```

To preview migration SQL without applying it:

```powershell
alembic upgrade head --sql
```

## Run the API

```powershell
uvicorn backend.main:app --reload
```

The API is available at `http://127.0.0.1:8000` and its interactive documentation is at `http://127.0.0.1:8000/docs`.

## Run With Docker

Docker Compose starts PostgreSQL 16, waits for its healthcheck, runs Alembic migrations, and then starts the API:

```powershell
docker compose up --build
```

The backend container uses `db` as the PostgreSQL hostname and receives `DATABASE_URL` automatically. Stop the services with:

```powershell
docker compose down
```

Add `-v` to the shutdown command only when you also want to remove the PostgreSQL data volume.

## Run Tests

```powershell
pytest
```

## Seed Demo Data

After the database migrations have been applied, populate the database with deterministic demo data:

```powershell
python backend/seed.py
```

The seed is idempotent and can be run again without duplicating the demo shop, owner user, suppliers, products, or sales. The demo owner credentials are `demo.owner@jiranimart.example` and `demo-password-123`.
