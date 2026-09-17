# Task Dashboard

A full-stack task management dashboard built with **React** and **Node.js**, deployed on **Vercel**.

## Live Demo

🔗 [Task Dashboard](https://task-3-dashboard-gray.vercel.app)

## Features

- **CRUD Operations** — Create, Read, Update, and Delete tasks
- **Status Tracking** — Pending, In Progress, Completed
- **Priority Levels** — High, Medium, Low with color-coded badges
- **Search & Filter** — Search by title/description, filter by status and priority
- **Stats Dashboard** — Real-time counts of total, pending, in-progress, and completed tasks
- **Responsive Design** — Works on desktop and mobile devices
- **Dark Theme** — Modern dark UI with gradient accents

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite |
| Backend | Vercel Serverless Functions |
| Styling | Custom CSS |

## Project Structure

```
Task-distribution/
├── api/
│   └── index.js          # Vercel serverless API handler
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main app component
│   │   ├── App.css        # Styles
│   │   ├── api.js         # API client functions
│   │   ├── main.jsx       # Entry point
│   │   └── components/
│   │       ├── TaskForm.jsx    # Create/Edit task form
│   │       ├── TaskCard.jsx    # Task display card
│   │       └── StatsBar.jsx    # Statistics bar
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── server.js          # Express server (local dev)
│   └── package.json
├── vercel.json            # Vercel deployment config
├── package.json           # Root package.json
└── .gitignore
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks (supports `?status=`, `?priority=`, `?search=`) |
| GET | `/api/tasks/:id` | Get a single task |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/stats` | Get task statistics |

## Local Development

### Backend

```bash
cd backend
npm install
npm run dev
```

Server runs on `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## Deployment

This project is deployed on **Vercel**. To deploy your own:

1. Fork this repository
2. Import on [vercel.com](https://vercel.com)
3. Click Deploy

## Author

**Amna Kaleem** — [GitHub](https://github.com/Amna503)
