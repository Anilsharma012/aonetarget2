# Aone Target Institute NEET Learning Platform

## Overview
A comprehensive NEET learning platform admin panel with full MongoDB integration. All admin functionality saves and retrieves data from MongoDB database.

## Technical Stack
- **Backend + Frontend**: Single Express.js server on port 5000 with Vite middleware
- **Architecture**: Vite runs in middleware mode inside Express (dev), or Express serves built dist (production)
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

## Recent Changes (Feb 8, 2026)
- **FIXED: "Failed to save" errors** - All PUT endpoints now strip `_id` field from request body before MongoDB update to prevent immutable field errors
- **Registration page dynamic categories** - Target Exam dropdown now fetches all active categories from database instead of hardcoded NEET/IIT-JEE/Both options
- **Dynamic banner carousel** - Home page hero banner now fetches banners from `/api/banners` instead of hardcoded slides; supports any number of banners with auto-slide
- **Realtime data sync** - Home page and Dashboard auto-refresh data every 15 seconds (polling) for live database updates
- **FIXED: Single port architecture** - Backend and frontend both run on port 5000 using Vite middleware mode
- No more WebSocket errors in Replit preview
- Express serves API routes, Vite middleware serves frontend with HMR
- Course exploration system with hierarchical navigation (NEET, IIT-JEE, Nursing CET, General Studies)

## Previous Changes (Feb 5, 2026)
- Added Global News modal popup to student Home screen (shows announcements with dismiss feature)
- Added Live Class Scheduler for admin (calendar + list view per course)
- Added LiveClassesCalendar for students (course-specific live class viewing)
- Added image URL field for course thumbnails with preview
- Integrated Tiptap-based rich text editor for course descriptions
- Enhanced test creation with openDate, closeDate, numberOfQuestions fields
- Added `/api/courses/:courseId/live-classes` endpoints (CRUD)
- Added `/api/students/:studentId/live-classes` endpoint for student view

## Previous Changes (Feb 4, 2026)
- Added complete API client with all MongoDB API functions
- Updated all admin components to use MongoDB APIs
- Added CRUD operations for all sidebar menu items
- Fixed coursesAPI to include update and delete methods
- All data now flows through MongoDB

## Development
- Run: `node server.js`
- Everything on: http://localhost:5000

## User Preferences
- Hindi-speaking user: "mere mongodb me save hona chiaye bhai"
- All data must be saved to MongoDB, no mock data
