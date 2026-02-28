# Ihsan Platform 🚀

A comprehensive platform featuring a modern web frontend, a robust backend API, and a cross-platform desktop application.

## 🏗 Project Structure

```text
ihsan-platform/
├── backend/            # Express.js API & Docker configuration
├── frontend/           # React + Vite + TypeScript web application
├── desktop/            # Electron + electron-vite desktop application
├── api_docs/           # API documentation
├── docker-compose.yml  # Root orchestration for all services
└── dev.sh              # Interactive development console
```

## 🛠 Technology Stack

- **Frontend**: React 19, Vite, TypeScript, Axios.
- **Backend**: Node.js, Express.js.
- **Desktop**: Electron, electron-vite.
- **Database**: PostgreSQL (Dockerized).
- **Infrastucture**: Docker, Docker Compose, Nginx (for frontend serving).

## 🚀 Quick Start (Development)

The easiest way to work on the project is using the included `dev.sh` console.

### 1. Initial Setup
Install dependencies across all components:
```bash
./dev.sh setup
```

### 2. Interactive Console
Launch the dev menu to run, test, or manage individual services:
```bash
./dev.sh
```

### 3. Common Development Commands
- **Run Backend + Frontend (local)**: `./dev.sh web`
- **Run All (Docker + Desktop)**: `./dev.sh all`
- **Frontend only**: `./dev.sh f:run`
- **Desktop only**: `./dev.sh d:run`

---

## 🐳 Docker Deployment

To run the entire stack in a production-like environment:

```bash
docker compose up --build
```

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Database**: Port 5432

---

## 💻 Desktop Application

The desktop app is built with Electron and integrates the existing frontend.

To develop the desktop app:
```bash
cd desktop
npm run dev
```

To build the desktop app for production:
```bash
cd desktop
npm run build
```

---

## ⚙️ Environment Variables

### Frontend (`frontend/.env`)
- `VITE_API_URL`: The URL of the backend API (default: `http://localhost:5000`).

### Backend (`backend/.env` or via Docker)
- `PORT`: Server port (default: 5000).
- `DATABASE_URL`: Postgres connection string.
- `FRONTEND_URL`: Allowed CORS origin.

---

## 🤝 Contribution Guidelines for the Team

1.  **TypeScript First**: Ensure all new frontend/desktop code uses TypeScript and passes linting (`npm run lint`).
2.  **Docker Conscious**: If you add new environment variables, update the `docker-compose.yml` and `.env.example` files.
3.  **Use dev.sh**: Prefer the `dev.sh` script for consistent environments across the team.
4.  **Desktop Sync**: Remember that the desktop app shares the frontend code; changes in the frontend will affect the desktop view.

---
*Created with ❤️ for the Ihsan Platform Team.*

**Don't touch any file you don't have permission to touch , if you don't do respect that i will cut off your dick , evry one now his part** 
