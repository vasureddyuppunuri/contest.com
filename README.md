# Weekly Project Arena

A full-stack application for weekly project challenges with role-based access, ratings, points, streaks, and a live leaderboard.

## Tech Stack

- Frontend: React (Vite) + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT (email/password)

## Getting Started

### 1) Configure Environment

Create environment files from the examples:

- client/.env.example -> client/.env
- server/.env.example -> server/.env

### 2) Install Dependencies

From each folder:

- client: npm install
- server: npm install

### 3) Seed Data (Optional)

From server:

- npm run seed

Seeded owner credentials:
- Email: owner@arena.com
- Password: OwnerPass123!

Seeded participant credentials:
- Email: alex@arena.com
- Password: Password123!

### 4) Run Locally

- server: npm run dev
- client: npm run dev

The frontend will run on http://localhost:5173 and the API on http://localhost:5000.

## Key Features

- Owner creates a weekly project with a 7-day duration.
- All participants compete automatically.
- Owner submits ratings (1-5 stars, 2 points per star) after the project ends.
- Points are cumulative; streaks increase for consecutive weekly participation.
- Leaderboard ranks by total points, then streak.
- Weekly winner highlighted on the active project screen.
