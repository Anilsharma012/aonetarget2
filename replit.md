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
- **11th-12th Category Page** - Custom layout for 11th-12th category (categoryId: iit-jee) with CBSE/HBSE board tabs, 2x2 content type grid (Recorded Batch, Live Classroom, Crash Course, Mock Test), and subject filters (Hindi, English, Math, Science, Social Science, Sanskrit). Uses boardType field for filtering.
- **Board Type Support** - New boardType field (cbse/hbse) added to courses for board classification. Admin panel has Board Type dropdown. Server API supports boardType query filter.
- **Content Type Detail Page** - New ContentTypeDetail screen (/content/:contentType) shows actual course content when content type cards are clicked. Recorded Batch shows video list (first free, rest locked). Live Classroom shows subject filter then live classes (all locked until purchase). Crash Course shows course cards. Mock Test shows test list (first free, rest locked). Sticky Buy Now bar at bottom with course price. Enrollment status check for free/locked indicators.
- **Content Type Navigation** - Category page content type cards (Recorded Batch, Live Classroom, Crash Course, Mock Test) now navigate to ContentTypeDetail instead of filtering inline. Passes exam/board/category params via URL.
- **11th-12th Subject Navigation** - Subject buttons in 11th-12th page navigate directly to course detail or content type page. Shows course count per subject.
- **NEET-IITJEE Category Page** - Custom layout with NEET/IIT-JEE tabs, 2x2 content grid, subject filters (Biology/Chemistry/Physics for NEET, Chemistry/Physics/Math for IIT-JEE). Uses examType field.
- **Category-Specific Layouts** - CategoryPage conditionally renders: NEET category → NeetIitJeePage, 11th-12th category → Class11_12Page, all others → original subcategory-based layout
- **Expanded Subject Options** - Admin course form now includes hindi, english, science, social_science, sanskrit in addition to biology, chemistry, physics, math
- **Chat System** - Full 1-on-1 chat between students and admin. Students message from Chats tab, admin sees all conversations in Chat Support panel with reply functionality. Auto-polling for real-time updates. MongoDB collections: chats, chatMessages.
- **Student Progress Tracking** - Test results recorded with testName, courseName, studentName in testResults collection. Student Dashboard shows real test results, course-wise progress bars, score trends. Admin AllReports shows all student test results with search/filter/pagination and detail modal.
- **Course Purchase Flow** - Full end-to-end purchase: SubCategoryDetail shows courses with free/locked content indicators, price, Buy Now button. Checkout fetches course from MongoDB, processes purchase via API with auto-enrollment. PurchaseSuccess screen. Free courses enroll directly. Enrolled courses show in StudentDashboard "My Courses" section with Continue button.
- **SubCategoryDetail Enhanced** - Shows free video/test counts per course, enrolled status badge, "Enroll Free" vs "Buy Now" buttons. Fetches real content metadata from course videos/tests APIs.
- **Course-Category Mapping** - Courses now have categoryId, subcategoryId, price, and type fields. Admin panel has dropdowns for category/subcategory selection (required). CategoryPage and SubCategoryDetail filter by these IDs.
- **Course CRUD Endpoints** - Added PUT /api/courses/:id and DELETE /api/courses/:id endpoints (were missing)
- **NEET Sample Courses** - 6 NEET courses seeded with proper category/subcategory mapping across Class 11, Class 12, and NEET Exam subcategories
- **Hierarchical Flow** - Category → Subcategory → Courses → Course Details flow now works with proper data mapping
- **Questions Admin Redesign** - Course → Test → Questions hierarchical flow with breadcrumb navigation
- **Mock Tests Linked to Courses** - Tests.tsx and TestSeries.tsx now use actual courses from DB with courseId instead of hardcoded strings. Student MockTests screen groups tests by course with filter tabs.
- **File Upload System** - Multer-based upload endpoint (POST /api/upload), supports images and PDFs up to 50MB, FileUploadButton reusable component
- **Image Upload in Admin** - Categories, Subcategories, Courses, and Questions all support image upload alongside URL input
- **PDF Upload** - Course content notes support PDF file upload alongside URL
- **Negative Marking** - Test-level and per-question negative marking support with decimal values (0.25, 0.5, 1)
- **Marks Per Question** - Configurable marks per question at test level
- **Question Images** - Question image + individual option images (A, B, C, D) with upload buttons
- **Student Test Images** - TestTaking screen displays question and option images during exam
- **Negative Marking Scoring** - Server-side and client-side scoring updated to deduct marks for wrong answers
- **Results Enhancement** - Test results now show negative marks deducted

### Previous Feb 9 Changes
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
