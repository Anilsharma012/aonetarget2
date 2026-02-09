# Aone Target Institute NEET Learning Platform

## Overview
A comprehensive NEET learning platform with admin panel, student dashboard, referral system, mock test engine, and full MongoDB integration. All functionality saves and retrieves data from MongoDB database.

## Technical Stack
- **Backend + Frontend**: Single Express.js server on port 5000 with Vite middleware
- **Architecture**: Vite runs in middleware mode inside Express (dev), or Express serves built dist (production)
- **Database**: MongoDB (database: aonetarget)
- **Styling**: Tailwind CSS
- **Charts**: Recharts

## Project Architecture

### Backend (server.js)
- Express.js REST API with CORS enabled
- MongoDB connection using native driver with DB readiness middleware (503 until connected)
- 70+ API endpoints covering all features
- Collections: courses, students, tests, questions, videos, livevideos, pdfs, packages, messages, blog, settings, banners, subjects, topics, subcourses, instructions, examdocuments, news, notifications, store, institute, referrals, referralSettings, testResults, purchases, enrollments

### Frontend (src/)
- React components in components/admin/
- Student screens in screens/
- API client in src/services/apiClient.ts
- All components use MongoDB for CRUD operations

### Student Screens
1. **Home** - Banners, categories, live classes, test series, featured batches, continue learning
2. **CourseDetails** - Full description, materials, share button, buy now, recorded/live tabs, YouTube embed, zoom controls
3. **MockTests** - Test listing with timing, test series
4. **TestTaking** - Full exam interface with timer, question navigation, auto-submit, results
5. **ReferEarn** - Referral dashboard with code, share buttons, earnings tracking
6. **CategoryPage** - Subcategory display with course filters
7. **SubCategoryDetail** - Courses filtered by subcategory with recorded/live tabs
8. **StudentDashboard** - Stats, progress, upcoming tests
9. **LiveClasses** - Live class schedule and calendar
10. **Batches** - Course batch listing

### Admin Components with MongoDB Integration
1. **Dashboard** - Real-time stats from MongoDB
2. **Store** - Product/course package management (with Cloudflare/CDN image URL support)
3. **Institute** - Institute profile settings
4. **Questions** - Question bank management
5. **Tests** - Mock test engine with timing
6. **Videos** - Video lecture management
7. **LiveVideos** - Live stream scheduling
8. **PDFs** - PDF document management
9. **Packages** - Course bundle management
10. **Messages** - Inbox/contact messages
11. **Blog** - Article publishing
12. **Settings** - Global configuration + Splash Screen settings
13. **Banners** - App slider banners with image preview and order
14. **Referrals** - Referral management, commission settings, approve/reject
15. **MiscSection** - Courses, Subjects, Topics, Subcourses, Instructions, Exam Documents, News, Notifications

### Key API Endpoints
- GET/POST /api/{collection} - CRUD operations
- POST /api/referrals/generate - Generate referral code
- GET /api/referrals/:studentId - Referral stats
- POST /api/referrals/apply - Apply referral code
- POST /api/purchases - Record purchase with auto-enrollment
- GET/PUT /api/admin/referral-settings - Commission configuration
- POST /api/tests/:testId/submit - Submit test with auto-scoring
- GET /api/tests/:id - Get test with questions

## Recent Changes (Feb 9, 2026)
- **Home Screen Content** - Added Live Classes, Popular Test Series, Featured Batches sections
- **Course Details** - Full description, materials summary, share button (Web Share API), Buy Now button, recorded/live tabs
- **Mock Test Engine** - Complete test-taking flow with countdown timer, question palette, auto-submit, results review
- **Referral System** - Full refer & earn: code generation, WhatsApp/Telegram sharing, earnings tracking
- **Admin Referrals** - Commission settings (fixed/percentage), approve/reject referrals, all referrals table
- **Purchase Gating** - Purchase API with auto-enrollment, purchase history
- **Subcategories** - Enhanced category navigation with course counts, recorded/live filters
- **YouTube Embed** - All URL formats supported, lazy loading, zoom controls
- **Image Hosting** - Cloudflare/CDN URL support in Store, image fallback system, lazy loading
- **DB Readiness** - Added middleware to gate API requests until MongoDB connects (prevents startup errors)
- **Registration Referral** - Optional referral code field in student registration

## Previous Changes (Feb 8, 2026)
- Complete UI Overhaul with logo color scheme (Navy #1A237E, Blue #303F9F, Red #D32F2F)
- Splash Screen with admin-manageable image, duration, active status
- Modern Pill Tabs, Category Cards, Continue Learning, Glassmorphism Bottom Nav
- Social Icons Hover Glow, Navigation Buttons
- Fixed "Failed to save" errors, Dynamic banner carousel, Realtime data sync

## Previous Changes (Feb 5, 2026)
- Global News modal popup, Live Class Scheduler, LiveClassesCalendar
- Image URL field for course thumbnails, Tiptap rich text editor
- Enhanced test creation with openDate, closeDate, numberOfQuestions

## Development
- Run: `node server.js`
- Everything on: http://localhost:5000

## User Preferences
- Hindi-speaking user
- All data must be saved to MongoDB, no mock data
- Brand colors: Navy #1A237E, Blue #303F9F, Red #D32F2F
