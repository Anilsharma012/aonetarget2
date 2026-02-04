# Aone Target Institute NEET Learning Platform

## Overview
A comprehensive NEET learning platform admin panel with full MongoDB integration. All admin functionality saves and retrieves data from MongoDB database.

## Technical Stack
- **Backend**: Express.js server on port 3001
- **Frontend**: React + TypeScript with Vite on port 5000
- **Database**: MongoDB (database: aonetarget)
- **Styling**: Tailwind CSS
- **Charts**: Recharts

## Project Architecture

### Backend (server.js)
- Express.js REST API with CORS enabled
- MongoDB connection using native driver
- 50+ API endpoints covering all admin features
- Collections: courses, students, tests, questions, videos, livevideos, pdfs, packages, messages, blog, settings, banners, subjects, topics, subcourses, instructions, examdocuments, news, notifications, store, institute

### Frontend (src/)
- React components in components/admin/
- API client in src/services/apiClient.ts
- All components use MongoDB for CRUD operations

### Admin Components with MongoDB Integration
1. **Dashboard** - Real-time stats from MongoDB
2. **Store** - Product/course package management
3. **Institute** - Institute profile settings
4. **Questions** - Question bank management
5. **Tests** - Mock test engine
6. **Videos** - Video lecture management
7. **LiveVideos** - Live stream scheduling
8. **PDFs** - PDF document management
9. **Packages** - Course bundle management
10. **Messages** - Inbox/contact messages
11. **Blog** - Article publishing
12. **Settings** - Global configuration
13. **Banners** - App slider banners
14. **MiscSection** - Courses, Subjects, Topics, Subcourses, Instructions, Exam Documents, News, Notifications

### API Endpoints Structure
- GET /api/{collection} - List all items
- POST /api/{collection} - Create new item
- PUT /api/{collection}/:id - Update item
- DELETE /api/{collection}/:id - Delete item

## Recent Changes (Feb 4, 2026)
- Added complete API client with all MongoDB API functions
- Updated all admin components to use MongoDB APIs
- Added CRUD operations for all sidebar menu items
- Fixed coursesAPI to include update and delete methods
- All data now flows through MongoDB

## Development
- Run: `node server.js & npm run dev:frontend`
- Server: http://localhost:3001
- Frontend: http://localhost:5000

## User Preferences
- Hindi-speaking user: "mere mongodb me save hona chiaye bhai"
- All data must be saved to MongoDB, no mock data
