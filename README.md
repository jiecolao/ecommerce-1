# CSE3 Monorepo (NestJS + React)
This project is a monorepo managed with [Turborepo](https://turbo.build/) and npm workspaces. It contains a NestJS backend and a Vite + React frontend.

## Prerequisites

- Node.js (v18+)
- npm

## Getting Started

1. **Install dependencies**
   Run the following command at the root of the repository to install all dependencies for both frontend and backend:
   ```bash
   npm install
   ```

2. **Run Development Servers**
   To start both the React frontend and the NestJS backend concurrently, run:
   ```bash
   npm run dev
   ```
   
   - The **React Frontend** will typically be available at [http://localhost:5173](http://localhost:5173)
   - The **NestJS Backend** will typically be available at [http://localhost:3000](http://localhost:3000)

## Project Structure

- `frontend/` - A Vite + React application styled with Tailwind CSS.
- `backend/` - A NestJS REST API with Prisma and Supabase.
- `shared/` - Shared TypeScript types/interfaces used by both frontend and backend.

## Deployment

Both applications are configured to be deployed on Vercel. 
- The frontend will be deployed as a standard Vite React application.
- The backend will be deployed as a Vercel Serverless function.
