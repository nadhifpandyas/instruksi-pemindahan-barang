# Instruksi Pemindahan Barang (IPB) Web App

Full-stack web application for managing IPB documents and workflows.

## Features
- RBAC (Admin, User Kebun, User Teknis)
- IPB CRUD with Status Workflow
- PDF Document Uploads & Preview
- Excel Import/Export
- Authentication (JWT)

## Prerequisites
- Node.js (v18+)
- SQLite (included for local dev) or PostgreSQL (configured via Docker)

## Setup & Installation

### Backend
1. Navigate to backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up Database (SQLite by default):
   ```bash
   npx prisma db push
   ```
4. Seed Initial Users:
   ```bash
   node scripts/seed.js
   ```
   *Creates users: admin, kebun, teknis (password: `password123`)*
5. Start Server:
   ```bash
   npm start
   ```
   *Server runs on http://localhost:5000*

### Frontend
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Dev Server:
   ```bash
   npm run dev
   ```
   *App runs on http://localhost:5173*

## Usage Guide

### Roles & Credentials
- **Admin**: `admin` / `password123` (Full access)
- **User Kebun**: `kebun` / `password123` (Create IPB, Upload Kebun Docs)
- **User Teknis**: `teknis` / `password123` (Upload Teknis Docs)

### Workflows
1. **Create IPB**: Login as Kebun/Admin -> Create New IPB -> Upload PDF.
2. **Review/Update**: Login as Admin -> Update Status/Text.
3. **Upload Technical Docs**: Login as Teknis -> Detail Page -> Upload Docs.
4. **Import Excel**: Detail Page -> Import Excel (Header: Description, Quantity, Unit).
   *Sample file located at `backend/sample_import.xlsx`.*
5. **Export Excel**: Detail Page -> Export Excel.

## Docker Support (Optional)
To run with PostgreSQL:
1. Ensure Docker is running.
2. Update `backend/.env` to use `DATABASE_URL` for Postgres.
3. Update `backend/prisma/schema.prisma` provider to `postgresql`.
4. Run:
   ```bash
   docker-compose up --build
   ```
