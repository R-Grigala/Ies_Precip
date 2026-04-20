# Ies_Precip

Flask-based precipitation monitoring application for viewing weather-station data on a map, filtering stored measurements, exporting CSV data, and managing stations and users through a web UI and REST API.

## What The Project Does

The application combines:

- A public map view that displays precipitation station information.
- An authenticated panel for filtering stored precipitation records by station, date, time range, and interval.
- CSV export tools for filtered weather data.
- JWT-based authentication and password-reset flows.
- Admin-oriented station management for adding, editing, and deleting stations.
- Database seeding and utility scripts for importing precipitation data.

## Tech Stack

- Python 3
- Flask
- Flask-RESTX
- Flask-JWT-Extended
- Flask-SQLAlchemy
- Flask-Migrate
- MySQL or SQLite, depending on configuration
- Bootstrap 5
- Vanilla JavaScript
- Docker + Nginx for containerized deployment

## Main Entry Points

- `app.py`
- `src/__init__.py`
- `src/config.py`
- `src/api/__init__.py`
- `src/commands.py`

## Key Features

### 1. Map View

The home page renders a map-based precipitation dashboard using MapTiler and custom frontend logic from `src/static/js/map/map.js`.

### 2. Filter And Export

The filter page lets authenticated users:

- choose a station
- select a date
- select a start/end time
- choose a sampling interval
- view filtered precipitation rows
- export CSV data

Relevant files:

- `src/templates/filter/filter.html`
- `src/api/filter.py`
- `src/static/js/filter/filter.js`
- `src/static/js/filter/export.js`

### 3. Authentication

The app supports:

- login
- admin-only user registration
- token refresh
- password reset by email
- viewing/editing account data

Relevant files:

- `src/api/authentication.py`
- `src/api/accounts.py`
- `src/views/auth/routes.py`
- `src/views/reset_password/routes.py`

### 4. Station Management

Admins can manage stations from a dedicated `/stations` page. The flow is modal-based and uses authenticated REST endpoints for create, read, update, and delete operations.

Relevant files:

- `src/views/stations/routes.py`
- `src/templates/stations/stations.html`
- `src/templates/stations/add_station.html`
- `src/templates/stations/edit.html`
- `src/templates/stations/delete.html`
- `src/static/js/stations/station.js`
- `src/static/js/stations/addStation.js`
- `src/static/js/stations/editStation.js`
- `src/static/js/stations/deleteStation.js`
- `src/api/stations.py`

## Data Model Summary

Important models:

- `Stations`: station metadata, coordinates, source URL, API URL, visibility state, fetch state
- `DivPositions`: UI/map placement metadata for station labels and display values
- `WeatherData`: precipitation records
- `PrevPrecip`: tracking values used for long accumulation calculations
- `User` and `Role`: authentication and authorization

See:

- `src/models/stations.py`
- `src/models/weather.py`
- `src/models/users.py`

## API Notes

Swagger UI is exposed at:

- `/api`

Some notable endpoints:

- `POST /api/login`
- `POST /api/registration`
- `POST /api/refresh`
- `GET /api/user`
- `GET /api/users`
- `POST /api/filter`
- `GET /api/stations`
- `POST /api/stations`
- `GET /api/stations/<id>`
- `PUT /api/stations/<id>`
- `DELETE /api/stations/<id>`

Most data-management endpoints require a JWT access token in the `Authorization` header.

## Environment Variables

The app reads variables from `.env`. Important values include:

- `MY_SECRET_KEY`
- `JWT_SECRET_KEY`
- `MYSQL_HOST`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_ROOT_PASSWORD`
- `MAIL_SERVER`
- `MAIL_PORT`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`

## Local Run

### 1. Install dependencies

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure environment

Create or update `.env` with the database, JWT, and mail settings listed above.

### 3. Start the app

```bash
python app.py
```

Default local entry points:

- App: `http://127.0.0.1:5000/`
- Swagger docs: `http://127.0.0.1:5000/api`

## Database Setup

The project includes Flask CLI commands:

- `flask init_db`
- `flask populate_db`
- `flask insert_db`

What they do:

- `init_db`: drops and recreates tables
- `populate_db`: loads seed CSV files, creates positions, previous-precip rows, roles, and starter users
- `insert_db`: updates map selection values for some stations

Important: `init_db` is destructive because it calls `drop_all()`.

## Docker Run

The repository also includes containerized deployment:

```bash
docker compose up --build
```

Services defined in `docker-compose.yaml`:

- `flask`
- `nginx`
- `db` (MySQL 8)

Published ports:

- `2023` for HTTP
- `2024` for HTTPS
- `3307` for MySQL host access

## Current Code Changes

The current worktree contains a substantial station-management feature expansion. The most important code changes are:

### New station UI

- Added a dedicated stations page and view registration.
- Added modal templates for add, edit, and delete actions.
- Added frontend scripts to load stations, submit create/edit requests, and delete stations without reloading the page.

Files:

- `src/views/stations/routes.py`
- `src/views/__init__.py`
- `src/templates/stations/stations.html`
- `src/templates/stations/add_station.html`
- `src/templates/stations/edit.html`
- `src/templates/stations/delete.html`
- `src/static/js/stations/station.js`
- `src/static/js/stations/addStation.js`
- `src/static/js/stations/editStation.js`
- `src/static/js/stations/deleteStation.js`

### Backend support for station CRUD

- Registered the stations blueprint in the app factory.
- Added station API support for listing, fetching, creating, editing, and deleting stations.
- Added admin permission checks around mutating station actions.
- Added automatic creation of related `DivPositions` and `PrevPrecip` rows when a station is created.
- Added cleanup of related metadata when a station is deleted.

Files:

- `src/__init__.py`
- `src/api/stations.py`
- `src/api/nsmodels/stations.py`
- `src/models/stations.py`
- `src/models/weather.py`

### Navigation and UX updates

- Added a `სადგურები` link to the navbar.
- Updated filter-page station selection to work with the new station-management flow.
- Added station-related styling and icon assets.

Files:

- `src/static/js/layout/navbar.js`
- `src/templates/filter/filter.html`
- `src/static/css/styles.css`
- `src/static/img/Icon.svg`
- `src/static/img/check-mark (1).svg`

### Supporting backend adjustments

- `Config` now ensures the export directory exists.
- Seed/import commands include `PrevPrecip` data creation.
- Account and station namespace code was updated alongside the new management flow.

Files:

- `src/config.py`
- `src/commands.py`
- `src/api/accounts.py`

## Repository Layout

```text
.
├── app.py
├── docker-compose.yaml
├── requirements.txt
├── migrations/
├── nginx/
├── tools/
└── src/
    ├── api/
    ├── models/
    ├── static/
    ├── templates/
    ├── utils/
    └── views/
```

## Notes

- The default `Config` currently points SQLAlchemy to a local SQLite database file unless you switch to the MySQL URI.
- The seed command contains hardcoded starter users; review that before using it in a shared or production environment.
- Station creation validates the external Weather.com/Wunderground-derived API endpoint before saving.
