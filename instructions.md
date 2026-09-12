# DEYAR — FULL CODING AGENT IMPLEMENTATION INSTRUCTION

## PROJECT ROOT

`/Users/mostafa/PycharmProjects/deyar`

---

# 1. ROLE

You are the primary senior/principal full-stack engineer responsible for designing and implementing **Deyar** end-to-end.

Build a real, clean, production-minded teaching marketplace web application.

The initial deployment must be inexpensive/free-host friendly and suitable for a limited number of users, but the architecture and code must allow rapid horizontal scaling later without a major rewrite.

Work directly in:

`/Users/mostafa/PycharmProjects/deyar`

Do not merely describe the implementation. Create the actual files, code, tests, documentation, configuration, and infrastructure required.

---

# 2. PRODUCT VISION

Deyar is a two-sided teaching marketplace.

## Students can

- Register/login
- Create a student profile
- Search/discover teachers
- Filter teachers
- View teacher profiles
- See ratings/reviews
- See subjects and teaching levels
- See experience
- See pricing
- See teacher availability
- Select available lesson slots
- Book a single lesson
- Request lessons from teachers requiring approval
- Instantly book teachers allowing instant booking
- Create recurring/multiple lessons
- View upcoming lessons
- View past lessons
- Cancel lessons
- Reschedule lessons where permitted
- Eventually review teachers

## Teachers can

- Register/login
- Create/edit teacher profile
- Upload profile photo
- Add biography
- Add headline
- Add subjects
- Add teaching levels
- Add languages
- Add experience
- Add location
- Set timezone
- Set pricing
- Configure lesson types/durations
- Configure weekly availability
- Configure blocked/vacation periods
- Choose instant booking or approval-required booking
- View booking requests
- Accept/reject requests
- View upcoming lessons
- View past lessons
- Eventually integrate external calendars
- Eventually receive payments

---

# 3. IMPORTANT PRODUCT DECISIONS

These decisions are intentional and should be preserved.

## 3.1 Internal database is source of truth

Do NOT treat Google Calendar, Outlook, Apple Calendar, etc. as the source of truth.

Deyar's PostgreSQL database is authoritative for Deyar bookings.

External calendars are future integrations.

---

## 3.2 Availability is represented as rules

Do NOT store every future availability slot as a database row.

Store windows such as:

```text
Monday 16:00-20:00
Tuesday 16:00-20:00
Saturday 09:00-14:00
```

Then dynamically generate available slots based on:

```text
Recurring availability
+
availability exceptions
+
existing bookings
+
lesson duration
+
minimum notice
+
buffers
```

---

## 3.3 Availability exceptions

Teachers must be able to block normal availability.

Examples:

```text
Vacation
Holiday
Doctor appointment
Personal time
Other blocked time
```

---

## 3.4 Booking modes

Teachers can choose:

### INSTANT

```text
Student
   ↓
Select available slot
   ↓
Book
   ↓
CONFIRMED
```

### APPROVAL_REQUIRED

```text
Student
   ↓
Select available slot
   ↓
Booking request
   ↓
Teacher
   ├── Accept
   └── Reject
```

---

## 3.5 Single vs recurring lessons

Do NOT represent a recurring course as one giant booking.

For example:

> Every Monday at 6 PM for 10 weeks.

Should become:

```text
LessonSeries
    |
    +-- Lesson #1
    +-- Lesson #2
    +-- Lesson #3
    ...
    +-- Lesson #10
```

Each lesson occurrence has its own status.

This allows individual lessons to be:

- cancelled
- rescheduled
- completed
- marked no-show

without destroying the series.

---

# 4. BOOKING STATE MACHINE

Use explicit states.

Recommended states:

```text
PENDING
CONFIRMED
REJECTED
CANCELLED
COMPLETED
NO_SHOW
EXPIRED
```

Valid transitions must be enforced server-side.

Example:

```text
PENDING
   |
   +----> CONFIRMED
   |
   +----> REJECTED
   |
   +----> CANCELLED

CONFIRMED
   |
   +----> CANCELLED
   |
   +----> COMPLETED
   |
   +----> NO_SHOW
```

Do not allow clients to arbitrarily modify booking status.

---

# 5. TEMPORARY BOOKING HOLDS

Payments are not part of the initial MVP.

However, design the booking domain so that temporary holds can later be introduced:

```text
AVAILABLE
    ↓
HELD
    ↓
PAYMENT
    ↓
CONFIRMED
```

and:

```text
HELD
   ↓
EXPIRED
   ↓
AVAILABLE
```

Do not implement unnecessary payment infrastructure in MVP.

---

# 6. TIMEZONE REQUIREMENTS

Timezone handling is critical.

Use IANA timezone names:

```text
America/Toronto
America/Los_Angeles
Europe/London
```

Rules:

- Store actual event timestamps in UTC.
- Store timezone identifiers separately.
- Never use naive datetimes in business logic.
- Teacher availability is defined in teacher-local time.
- A booking represents one actual instant.
- Frontend displays times appropriately in the user's timezone.
- Clearly show timezone when booking.
- Test daylight saving time transitions.

Example:

Teacher:

```text
Toronto
6:00 PM
```

Student:

```text
Vancouver
3:00 PM
```

Both represent the same UTC instant.

---

# 7. TEACHER PROFILE

Teacher profile should support:

```text
first_name
last_name
profile_photo
headline
bio

location
timezone

years_experience

subjects
teaching_levels
languages

hourly_rate

booking_mode

is_verified
is_active

created_at
updated_at
```

Do not allow teachers to manually enter their rating.

Ratings are derived from reviews.

---

# 8. STUDENT PROFILE

Student:

```text
first_name
last_name
profile_photo

location
timezone

subjects
learning_goals
skill_level

created_at
updated_at
```

Do not collect unnecessary personal information.

---

# 9. USERS

Use a custom Django User model from the beginning.

Suggested fields:

```text
id
email
password
first_name
last_name
timezone
is_active
created_at
updated_at
```

Design the role system so a user can eventually be both a teacher and student if required.

Avoid unnecessarily making teacher/student mutually exclusive at the database level.

---

# 10. SUBJECTS

Create:

```text
Subject
-------
id
name
slug
active
```

Teacher relationship:

```text
TeacherSubject
--------------
teacher
subject
level
```

Student interests can reference subjects.

---

# 11. TEACHER LANGUAGES

Create:

```text
TeacherLanguage
---------------
teacher
language
```

---

# 12. TEACHER AVAILABILITY

Create:

```text
TeacherAvailability
-------------------
teacher
day_of_week
start_time
end_time
timezone
active
```

Example:

```text
Monday 16:00-20:00
Tuesday 16:00-20:00
Saturday 09:00-14:00
```

Validate:

```text
start_time < end_time
```

---

# 13. AVAILABILITY EXCEPTIONS

Create:

```text
AvailabilityException
---------------------
teacher
start_datetime
end_datetime
exception_type
reason
created_at
```

Types:

```text
VACATION
BLOCKED
HOLIDAY
OTHER
```

Validate:

```text
start_datetime < end_datetime
```

---

# 14. LESSON TYPES

Avoid hardcoding lesson duration.

Create a concept such as:

```text
LessonType
----------
teacher
name
duration_minutes
price
active
```

Examples:

```text
30 minutes
45 minutes
60 minutes
```

The architecture must allow different lesson types/prices later.

---

# 15. LESSON SERIES

Create:

```text
LessonSeries
------------
teacher
student
lesson_type

frequency
day_of_week
local_start_time
timezone

start_date
end_date
number_of_sessions

status

created_at
updated_at
```

MVP frequency:

```text
SINGLE
WEEKLY
```

Design an abstraction so future recurrence rules can support:

```text
BIWEEKLY
CUSTOM
RRULE
```

Do not implement an enormous recurrence engine unnecessarily.

---

# 16. LESSON / BOOKING

Choose a clean model.

At minimum each actual lesson occurrence must contain:

```text
teacher
student
lesson_series nullable
lesson_type

start_datetime_utc
end_datetime_utc

status

created_at
updated_at
```

You may create a separate Booking entity if it improves the model, but do not duplicate concepts unnecessarily.

Document the decision in:

`docs/booking.md`

---

# 17. BOOKING SERVICE

Complex booking logic must live in service/domain code rather than HTTP views.

Create something conceptually similar to:

```text
bookings/services.py
```

Functions should include:

```text
get_available_slots(...)
create_booking(...)
approve_booking(...)
reject_booking(...)
cancel_booking(...)
reschedule_booking(...)
create_lesson_series(...)
```

Views/controllers should remain thin.

---

# 18. BOOKING TRANSACTION

Booking creation must be transactional.

Conceptually:

```text
BEGIN TRANSACTION

verify teacher
verify lesson type
verify requested slot
verify teacher availability
verify exceptions
verify notice requirements
verify conflicting bookings
create booking
COMMIT
```

Use PostgreSQL transactions and appropriate locking/constraints.

Do NOT rely solely on:

```python
if slot_available():
    create_booking()
```

Two users can make the request concurrently.

---

# 19. DOUBLE BOOKING PROTECTION

This is a critical requirement.

The system must prevent:

```text
Student A ──┐
            ├── Teacher — 6:00 PM
Student B ──┘
```

from both successfully booking the same slot.

Use PostgreSQL constraints and/or transaction locking.

Consider PostgreSQL range/exclusion constraints using `tstzrange` if appropriate.

The final implementation must document the concurrency strategy.

Write explicit tests for concurrent/conflicting booking scenarios.

---

# 20. AVAILABLE SLOT GENERATION

Implement a reusable scheduling service.

Inputs:

```text
teacher
date/date range
lesson type/duration
```

Process:

```text
1. Load recurring availability
2. Interpret it in teacher timezone
3. Apply exceptions
4. Retrieve existing bookings
5. Generate candidate intervals
6. Remove conflicts
7. Apply minimum notice
8. Apply buffers
9. Return slots
```

Do not persist every theoretical future slot.

Return enough information for the frontend to display:

```text
UTC timestamp
teacher-local timestamp
user-local timestamp
duration
lesson type
```

---

# 21. SEARCH

Initial search should use PostgreSQL.

Support filters:

```text
subject
teaching level
location
minimum rating
price range
language
availability/date
```

Use appropriate indexes.

Avoid N+1 queries.

Use:

```text
select_related
prefetch_related
```

where appropriate.

Keep search implementation modular so OpenSearch can be introduced later.

---

# 22. TEACHER PROFILE PAGE

Public profile should contain:

```text
Teacher name
Photo
Headline
Bio
Subjects
Levels
Languages
Experience
Location
Rating
Review count
Lesson types
Prices
Availability
Next available slots
Verification badge
Reviews
```

Do NOT expose private information such as:

```text
private email
private phone
internal database details
```

unless explicitly intended.

---

# 23. REVIEWS

Create:

```text
Review
------
student
teacher
lesson
rating
comment
created_at
updated_at
```

Rules:

- rating must be 1-5
- only completed lessons can be reviewed
- only the student associated with the lesson can review
- one review per lesson
- student cannot review themselves
- teacher cannot modify the student's review
- validate everything server-side

Teacher rating should be calculated from reviews.

Cache aggregate values if useful.

---

# 24. FRONTEND TECHNOLOGY

Use:

```text
Next.js
React
TypeScript
Tailwind CSS
TanStack Query
React Hook Form
Zod
```

Use modern Next.js architecture.

Teacher profile pages must be SEO-friendly.

---

# 25. FRONTEND STRUCTURE

Suggested:

```text
frontend/
├── app/
│   ├── (public)/
│   │   ├── teachers/
│   │   ├── search/
│   │   └── ...
│   │
│   ├── student/
│   │   ├── dashboard/
│   │   ├── bookings/
│   │   ├── calendar/
│   │   └── profile/
│   │
│   ├── teacher/
│   │   ├── dashboard/
│   │   ├── availability/
│   │   ├── bookings/
│   │   ├── calendar/
│   │   └── profile/
│   │
│   └── ...
│
├── components/
│   ├── teacher/
│   ├── booking/
│   ├── calendar/
│   ├── search/
│   └── ui/
│
├── hooks/
├── lib/
│   ├── api/
│   ├── auth/
│   └── utils/
├── types/
├── tests/
└── public/
```

Improve this structure if a strong engineering reason exists.

---

# 26. FRONTEND ROUTES

Public:

```text
/
 /teachers
 /teachers/[slug]
 /search
 /login
 /register
 /forgot-password
```

Student:

```text
/student/dashboard
/student/bookings
/student/calendar
/student/profile
```

Teacher:

```text
/teacher/dashboard
/teacher/profile
/teacher/availability
/teacher/bookings
/teacher/calendar
/teacher/students
```

Protect authenticated routes.

---

# 27. FRONTEND UX

Build a polished, modern, responsive application.

Prioritize:

```text
Desktop
Tablet
Mobile
```

Teacher search should include:

```text
Subject
Level
Location
Price
Rating
Availability
Language
```

Teacher profile should have a strong:

```text
Book Lesson
```

CTA.

Booking UI must clearly show:

```text
Teacher
Date
Time
Timezone
Duration
Price
```

Provide clear success/error/loading/empty states.

---

# 28. ACCESSIBILITY

Implement:

- semantic HTML
- keyboard navigation
- labels
- focus management
- screen-reader-friendly controls
- sufficient contrast
- accessible forms
- accessible modals/dialogs
- accessible calendar controls

---

# 29. SEO

Teacher profile pages should be indexable.

Implement:

- meaningful page titles
- meta descriptions
- canonical URLs where appropriate
- sitemap
- robots configuration
- Open Graph metadata
- structured metadata where useful

Use teacher slugs instead of exposing database IDs in public URLs when practical.

---

# 30. BACKEND TECHNOLOGY

Use:

```text
Python
Django
Django REST Framework
PostgreSQL
Django ORM
Django Admin
```

Use a modular monolith.

---

# 31. BACKEND STRUCTURE

Suggested:

```text
backend/
├── manage.py
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   ├── test.py
│   │   └── production.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
│
├── users/
├── teachers/
├── students/
├── subjects/
├── availability/
├── bookings/
├── reviews/
├── notifications/
├── payments/
├── calendar/
├── common/
└── tests/
```

Each domain app should separate:

```text
models
services
selectors
serializers
views
urls
tests
```

where appropriate.

Do not force artificial layers where unnecessary.

---

# 32. MODULAR MONOLITH

Do NOT start with microservices.

The architecture should be:

```text
Next.js
   |
Django REST API
   |
PostgreSQL
```

The Django application must remain stateless at the web/API layer.

Later it can become:

```text
Load Balancer
    |
+---+---+---+
|   |   |   |
Django instances
    |
PostgreSQL
```

without rewriting domain logic.

---

# 33. REST API

Use:

```text
/api/v1/
```

Examples:

```text
GET    /api/v1/teachers
GET    /api/v1/teachers/{id}
GET    /api/v1/teachers/{id}/availability
GET    /api/v1/teachers/{id}/reviews

GET    /api/v1/me
PUT    /api/v1/me

GET    /api/v1/teacher/me
PATCH  /api/v1/teacher/me

GET    /api/v1/teacher/me/availability
POST   /api/v1/teacher/me/availability
PATCH  /api/v1/teacher/me/availability/{id}
DELETE /api/v1/teacher/me/availability/{id}

GET    /api/v1/bookings
POST   /api/v1/bookings
GET    /api/v1/bookings/{id}

POST   /api/v1/bookings/{id}/approve
POST   /api/v1/bookings/{id}/reject
POST   /api/v1/bookings/{id}/cancel
POST   /api/v1/bookings/{id}/reschedule

POST   /api/v1/lesson-series
GET    /api/v1/lesson-series
GET    /api/v1/lesson-series/{id}

POST   /api/v1/reviews
GET    /api/v1/teachers/{id}/reviews
```

Use consistent error responses.

Generate OpenAPI documentation if practical.

---

# 34. AUTHENTICATION

Implement:

- registration
- login
- logout
- current-user endpoint
- password reset architecture
- protected frontend routes
- server-side permissions

Prefer secure HTTP-only cookies/session authentication where practical.

Do not put long-lived authentication secrets into localStorage without a compelling documented reason.

---

# 35. AUTHORIZATION

Students can:

```text
View public teachers
Manage own profile
Create bookings
View own bookings
Cancel own bookings
Review eligible lessons
```

Teachers can:

```text
Manage own profile
Manage own availability
Manage own exceptions
Manage lesson types
View own bookings
Accept/reject requests
View their students
```

Admins can:

```text
Manage users
Manage teachers
Manage students
Manage bookings
Manage reviews
Manage subjects
Moderate content
```

Every protected endpoint must enforce authorization server-side.

---

# 36. DATABASE

Use PostgreSQL from day one.

Do NOT start with SQLite.

Use:

- migrations
- foreign keys
- indexes
- unique constraints
- check constraints
- transactions

Important indexes should cover:

```text
teacher active status
teacher-subject relationships
teacher bookings
student bookings
booking start/end/status
teacher reviews
search/filter fields
```

---

# 37. DATABASE INTEGRITY

Examples:

```text
User.email unique

Review.lesson unique

Review.rating between 1 and 5

Availability.start < Availability.end

Lesson.start < Lesson.end
```

Enforce constraints at the database where practical, not only in frontend code.

---

# 38. REDIS

Redis is a future-ready component.

It can be used for:

- caching
- rate limiting
- temporary booking holds
- Celery broker/backend

Do not make Redis mandatory for the simplest free MVP deployment unless necessary.

---

# 39. CELERY

Use Celery when background processing is introduced.

Suitable tasks:

```text
Email
SMS
Lesson reminders
Calendar synchronization
Analytics aggregation
Other slow/non-critical jobs
```

Never make core booking correctness dependent on an asynchronous task.

---

# 40. NOTIFICATIONS

Define event concepts:

```text
BOOKING_CREATED
BOOKING_CONFIRMED
BOOKING_REJECTED
BOOKING_CANCELLED
LESSON_REMINDER
LESSON_COMPLETED
REVIEW_REQUESTED
```

Future channels:

```text
Email
SMS
Push
In-app
```

Avoid duplicate notifications.

Background tasks should be idempotent.

---

# 41. PAYMENTS

Do not implement payments in MVP unless required.

Design for future Stripe Connect integration.

Future model:

```text
Student
   |
Stripe
   |
+--+----------------+
|                   |
Platform fee      Teacher payout
```

Do not store credit card information.

Payment state should be separate from booking state.

Stripe webhooks must be idempotent.

---

# 42. VIDEO

Do not implement video infrastructure in MVP.

Future abstraction should support:

```text
LiveKit
Zoom
Daily
```

A lesson can eventually contain:

```text
video_provider
external_meeting_id
meeting_url
```

---

# 43. CALENDAR INTEGRATIONS

Future only.

Potential integrations:

```text
Google Calendar
Microsoft Outlook
Apple Calendar
iCal
```

Architecture:

```text
Deyar DB
   |
Calendar Adapter
   +-- Google
   +-- Microsoft
   +-- Apple
```

External events may block availability, but Deyar bookings remain authoritative.

---

# 44. FILE STORAGE

MVP:

Local media storage is acceptable.

Production:

Use S3-compatible object storage.

Profile photos should eventually be stored outside the application container filesystem.

Use a storage abstraction so application logic does not depend on S3.

---

# 45. SECURITY

Implement:

- HTTPS in production
- secure cookies
- CSRF protection
- CORS allowlist
- password hashing
- rate limiting
- input validation
- authorization
- secure file uploads
- production security headers
- DEBUG=False in production
- ALLOWED_HOSTS
- secrets via environment variables
- no secrets committed to Git

Never trust frontend-provided:

```text
price
role
teacher ownership
permissions
booking status
```

The backend must calculate/validate authoritative values.

---

# 46. OBSERVABILITY

MVP:

- structured logs
- useful errors
- health endpoint
- database health check

Future:

- Sentry
- OpenTelemetry
- CloudWatch
- metrics
- tracing

Track:

```text
API latency
5xx rate
booking success
booking conflicts
teacher acceptance rate
payment failures
queue depth
database connections
```

---

# 47. PRODUCT METRICS

Eventually measure:

```text
Teacher search -> profile view
Profile view -> booking
Booking request -> acceptance
Booking -> completion
Completion -> review
Teacher response time
Teacher availability utilization
```

Do not build an enormous analytics platform in MVP.

---

# 48. TESTING

Backend:

- unit tests
- model tests
- service tests
- API tests
- permission tests
- timezone tests
- recurrence tests
- cancellation tests
- booking conflict tests
- concurrency tests

Frontend:

- component tests
- form tests
- interaction tests

E2E:

```text
Register student
Register teacher
Create teacher profile
Create availability
Search teachers
View profile
Book lesson
Teacher accepts
Student sees confirmation
Cancel lesson
Create recurring series
Complete lesson
Review teacher
```

Use appropriate modern tools such as:

```text
pytest
pytest-django
Playwright
React testing tools
```

---

# 49. CRITICAL BOOKING TESTS

Must test:

1. Student cannot double-book same lesson.
2. Two students cannot book same teacher slot.
3. Cancelled booking releases slot.
4. Pending booking behavior is correct.
5. Approval booking works.
6. Instant booking works.
7. Recurring series does not create conflicts.
8. Individual recurring lesson can be cancelled.
9. Timezones are correct.
10. DST transitions are correct.
11. Minimum notice works.
12. Availability exceptions work.
13. Teacher cannot manipulate another teacher's availability.
14. Student cannot modify another student's booking.
15. Invalid state transitions are rejected.

---

# 50. DOCKER

Provide:

```text
Dockerfile
```

for backend and frontend.

Provide:

```text
docker-compose.yml
```

for local development.

Prefer:

```text
PostgreSQL
```

in Docker for local development.

Redis can also be included when required.

Local development should be simple and documented.

---

# 51. ENVIRONMENT VARIABLES

Create:

```text
.env.example
```

Potential values:

```text
DATABASE_URL
DJANGO_SECRET_KEY
DJANGO_DEBUG
DJANGO_ALLOWED_HOSTS
CORS_ALLOWED_ORIGINS
NEXT_PUBLIC_API_URL
REDIS_URL
EMAIL configuration
storage configuration
future Stripe configuration
future calendar configuration
```

Never commit real `.env`.

---

# 52. CI/CD

Use GitHub Actions.

Pull request pipeline:

```text
PR
 |
 +-- lint
 +-- format check
 +-- type check
 +-- backend tests
 +-- frontend tests
 +-- build
 +-- dependency/security checks
```

Main branch:

```text
CI
 |
Build
 |
Deploy staging
```

Production:

```text
Release
 |
Manual approval
 |
Build immutable artifact
 |
Deploy
 |
Run safe migrations
 |
Health check
 |
Rollback if needed
```

Never automatically run destructive database operations.

---

# 53. GIT

If not already a Git repository, initialize one.

Create a strong `.gitignore`.

Never commit:

```text
.env
credentials
API keys
node_modules
virtual environments
local databases
build artifacts
secrets
```

Use logical branches such as:

```text
main
feature/auth
feature/teacher-profile
feature/availability
feature/bookings
```

---

# 54. INITIAL DEPLOYMENT

The first deployment should be free/low-cost.

The application must not depend on expensive AWS infrastructure.

Possible architecture:

```text
Free/low-cost Next.js host
        |
Free/low-cost Django host
        |
Free/low-cost PostgreSQL
```

Choose practical providers based on current availability and document limitations.

If a free host sleeps/hibernates, document the implications.

Do not embed provider-specific logic in the domain.

---

# 55. FUTURE AWS ARCHITECTURE

When Deyar becomes successful:

```text
CloudFront
    |
Application Load Balancer
    |
+---+---+---+
|   |   |   |
Django instances
    |
+---+----------------+
|                    |
RDS PostgreSQL      Redis
                     |
                  Celery
                  Workers
                     |
          +----------+----------+
          |          |          |
        Email      Calendar   Other
```

Use eventually:

```text
AWS CloudFront
AWS ALB
AWS ECS/Fargate
AWS RDS PostgreSQL
AWS ElastiCache Redis
AWS S3
AWS Secrets Manager
AWS CloudWatch
AWS Route 53
Terraform
```

Do not require these for MVP.

---

# 56. INFRASTRUCTURE AS CODE

Create:

```text
infra/
├── terraform/
│   ├── environments/
│   │   ├── dev/
│   │   ├── staging/
│   │   └── production/
│   └── modules/
└── deployment/
```

Terraform should be structured for future infrastructure.

Do not automatically provision expensive infrastructure merely because Terraform configuration exists.

---

# 57. SCALABILITY PRINCIPLES

The application must be:

- stateless at API tier
- horizontally scalable
- PostgreSQL-backed
- cache-friendly
- background-job friendly
- API-versioned
- modular
- provider-independent where practical

Avoid:

- in-memory global state
- local filesystem persistence in production
- hardcoded URLs
- hardcoded timezones
- hardcoded lesson durations
- hardcoded payment logic
- unnecessary microservices

---

# 58. SEARCH SCALING

MVP:

```text
PostgreSQL
```

Later:

```text
PostgreSQL
     |
Indexing pipeline
     |
OpenSearch
```

Only introduce OpenSearch when search complexity/scale justifies it.

---

# 59. CACHING

Safe candidates:

```text
Public teacher profiles
Subject lists
Static metadata
```

Be careful caching:

```text
Availability
Bookings
```

Do not sacrifice booking correctness for caching.

---

# 60. ADMIN

Configure Django Admin for:

```text
Users
Teachers
Students
Subjects
Availability
Availability exceptions
Lesson types
Lesson series
Lessons
Bookings
Reviews
Notifications
```

Add useful:

- search
- filtering
- ordering
- read-only fields
- admin permissions

Admin should make it possible to investigate booking problems.

---

# 61. PRIVACY

Minimize collection of personal data.

Do not publicly expose:

```text
student email
student phone
private teacher contact information
internal database identifiers
```

Prepare architecture for:

- account deactivation
- data deletion
- auditability

---

# 62. MVP FEATURE SET

Implement these first.

## Authentication

- Registration
- Login
- Logout
- Current user
- Password reset architecture
- Teacher/student profile creation

## Teacher

- Profile
- Photo
- Bio
- Headline
- Subjects
- Levels
- Languages
- Experience
- Location
- Timezone
- Pricing
- Booking mode
- Weekly availability
- Exceptions

## Student

- Profile
- Location
- Timezone
- Subjects/interests

## Discovery

- Teacher list
- Search
- Filters
- Pagination
- Teacher profile
- Ratings
- Availability

## Booking

- Slot selection
- Single lesson
- Instant booking
- Approval-required booking
- Cancellation
- Teacher approval/rejection
- Dashboards

## Recurring

- Weekly lesson series
- Individual lesson occurrences
- Individual occurrence cancellation
- Series management

## Reviews

- Completed lesson review
- Rating
- Comment
- Aggregate rating

## Admin

- Django Admin

---

# 63. MVP NON-GOALS

Do not initially implement:

- Payments
- Video infrastructure
- External calendar synchronization
- Advanced messaging
- Native mobile apps
- AI teacher matching
- Subscriptions
- Coupons
- Advanced analytics

Create clean extension points instead.

---

# 64. DEVELOPMENT ENVIRONMENT

The owner uses macOS, zsh, PyCharm and Docker.

Prefer commands that work well on macOS.

Do not assume Linux-only commands.

Keep local development simple.

---

# 65. DOCUMENTATION

Create:

```text
docs/architecture.md
docs/database.md
docs/booking.md
docs/api.md
docs/deployment.md
```

`docs/booking.md` must explicitly explain:

- availability rules
- exceptions
- slot generation
- timezone behavior
- booking states
- concurrency strategy
- recurring lessons
- cancellation
- rescheduling

---

# 66. README

README must contain:

- What Deyar is
- Architecture
- Tech stack
- Local setup
- Environment variables
- Backend startup
- Frontend startup
- Docker startup
- Tests
- Linting
- API
- Deployment
- Project structure
- Scaling strategy

---

# 67. DEFINITION OF DONE

A feature is NOT complete merely because its happy path works.

A feature is complete when:

- model/database support exists
- migration exists
- API exists
- validation exists
- authorization exists
- business logic exists
- frontend UI exists
- loading states exist
- error states exist
- tests exist
- documentation is updated
- lint passes
- type checking passes
- tests pass

---

# 68. BOOKING DEFINITION OF DONE

Booking is not complete until:

- availability works
- exceptions work
- timezones work
- booking modes work
- conflicts are prevented
- cancellation works
- approval/rejection works
- recurring lessons work
- concurrent booking is tested
- permissions work
- frontend state is correct

---

# 69. DO NOT OVERENGINEER

Do NOT introduce:

```text
Kubernetes
Microservices
Kafka
Service mesh
GraphQL
OpenSearch
Custom WebRTC
ML recommendation system
```

unless a concrete requirement appears.

The initial system should be maintainable by a small engineering team.

---

# 70. FUTURE SCALING ORDER

When Deyar grows, scale in this order:

1. Optimize PostgreSQL queries.
2. Add indexes.
3. Add Redis caching.
4. Add Celery/background workers.
5. Move files to S3.
6. Add CDN.
7. Horizontally scale Django.
8. Use managed PostgreSQL.
9. Add read replicas if necessary.
10. Add observability/tracing.
11. Add OpenSearch if needed.
12. Split services only when there is a clear technical/organizational reason.

Do NOT prematurely split the monolith.

---

# 71. IMPLEMENTATION PHASES

## PHASE 0 — INSPECT ENVIRONMENT

Before changing anything:

- Inspect `/Users/mostafa/PycharmProjects/deyar`
- Determine whether files already exist.
- Determine whether Git already exists.
- Do not destroy existing work.
- Inspect Python version.
- Inspect Node version.
- Inspect Docker availability.
- Inspect package managers.
- Determine whether an existing project needs to be preserved.

If an existing codebase exists, adapt it rather than blindly replacing it.

---

## PHASE 1 — FOUNDATION

Create:

- repository structure
- Django project
- custom User
- Next.js project
- PostgreSQL
- environment configuration
- Docker Compose
- linting
- formatting
- tests
- README
- architecture documentation
- health endpoint

Confirm:

```text
Backend runs
Frontend runs
Database connects
Migrations work
Tests run
```

---

## PHASE 2 — AUTH

Implement:

- registration
- login
- logout
- current user
- profiles
- permissions
- protected frontend routes

---

## PHASE 3 — TEACHERS/STUDENTS

Implement:

- teacher models
- student models
- subjects
- languages
- profile APIs
- profile UI
- teacher public pages

---

## PHASE 4 — AVAILABILITY

Implement:

- weekly availability
- exceptions
- lesson types
- slot generation
- timezone handling

This phase requires extensive tests.

---

## PHASE 5 — BOOKING

Implement:

- single lessons
- instant booking
- approval-required booking
- booking state machine
- conflict prevention
- cancellation
- dashboards

---

## PHASE 6 — RECURRING

Implement:

- weekly series
- lesson occurrences
- individual cancellation
- series management
- conflict handling

---

## PHASE 7 — REVIEWS

Implement:

- completed lesson reviews
- rating
- comments
- teacher aggregate rating

---

## PHASE 8 — UX

Polish:

- teacher discovery
- teacher profile
- booking flow
- dashboards
- calendars
- responsive/mobile experience
- accessibility
- SEO

---

## PHASE 9 — CI/CD

Implement GitHub Actions:

```text
Lint
Format
Type check
Tests
Build
Security checks
```

---

## PHASE 10 — DEPLOYMENT

Prepare free/low-cost deployment.

Document exact deployment steps.

---

## PHASE 11 — SCALE READINESS

Review:

- indexes
- N+1 queries
- transactions
- statelessness
- caching
- background jobs
- security
- observability
- backups
- deployment rollback
- storage abstraction

---

# 72. AGENT BEHAVIOR

When implementing:

1. Work directly in `/Users/mostafa/PycharmProjects/deyar`.
2. Actually create and modify files.
3. Run tests after meaningful changes.
4. Run lint/type checks.
5. Fix failures before moving forward.
6. Do not leave TODO placeholders for core MVP functionality.
7. If a decision is ambiguous, choose the simplest production-safe option.
8. Document non-obvious decisions.
9. Do not ask for confirmation for routine engineering choices.
10. Do not delete existing work without inspecting it.
11. Never commit secrets.
12. Keep business logic out of HTTP controllers where practical.
13. Prefer mature technologies.
14. Correctness is more important than cleverness.
15. Backend is authoritative.
16. Database integrity matters.
17. Timezone behavior must be explicit.
18. Write tests around difficult business logic.
19. Keep the architecture ready for scaling without prematurely adding infrastructure.
20. If a dependency becomes obsolete or incompatible, choose the current stable alternative and document the decision.

---

# 73. FINAL ACCEPTANCE CHECKLIST

Before declaring Deyar MVP ready:

- [ ] Project exists under `/Users/mostafa/PycharmProjects/deyar`
- [ ] Git configured
- [ ] README complete
- [ ] Architecture documentation complete
- [ ] Django backend works
- [ ] Next.js frontend works
- [ ] PostgreSQL works
- [ ] Docker Compose works
- [ ] Environment configuration documented
- [ ] Custom User implemented
- [ ] Teacher profile implemented
- [ ] Student profile implemented
- [ ] Subjects implemented
- [ ] Teacher languages implemented
- [ ] Teacher availability implemented
- [ ] Availability exceptions implemented
- [ ] Lesson types implemented
- [ ] Timezone handling implemented
- [ ] Slot generation implemented
- [ ] Single booking implemented
- [ ] Instant booking implemented
- [ ] Approval booking implemented
- [ ] Booking state machine implemented
- [ ] Double-booking protection implemented
- [ ] Cancellation implemented
- [ ] Recurring lesson series implemented
- [ ] Individual recurring lessons implemented
- [ ] Reviews implemented
- [ ] Teacher rating aggregation implemented
- [ ] Teacher search implemented
- [ ] Teacher profile page implemented
- [ ] Student dashboard implemented
- [ ] Teacher dashboard implemented
- [ ] Django Admin configured
- [ ] API versioning implemented
- [ ] Authorization implemented
- [ ] Validation implemented
- [ ] Backend tests implemented
- [ ] Frontend tests implemented
- [ ] Critical E2E tests implemented
- [ ] CI implemented
- [ ] Deployment documented
- [ ] Secrets excluded from Git
- [ ] Production security settings configured
- [ ] Health check implemented
- [ ] No critical TODOs remain
- [ ] No known failing tests
- [ ] No known lint/type errors

---

# 74. CORE ARCHITECTURAL GOAL

The architecture should support this progression.

## TODAY

```text
Internet
   |
Next.js
   |
Django
   |
PostgreSQL
```

Small/free/low-cost deployment.

## LATER

```text
                    Load Balancer
                         |
              +----------+----------+
              |          |          |
           Django     Django     Django
              |          |          |
              +----------+----------+
                         |
                    PostgreSQL
                         |
              +----------+----------+
              |                     |
            Redis              Read Replicas
              |
           Celery
           Workers
              |
       +------+------+------+
       |      |      |      |
     Email  SMS  Calendar  Other
```

The fundamental application/domain code should remain largely unchanged.

---

# 75. START NOW

Begin by inspecting:

```text
/Users/mostafa/PycharmProjects/deyar
```

Then execute:

```text
PHASE 0
PHASE 1
```

Do not stop at an architectural explanation.

Create the actual project foundation.

At the end of every phase:

1. Summarize files created/modified.
2. Summarize functionality implemented.
3. List tests run.
4. List lint/type checks run.
5. List commands needed to run locally.
6. List intentional architectural decisions.
7. List remaining non-blocking work.
8. Proceed to the next phase unless a genuine blocker exists.

The ultimate goal is a working Deyar MVP with a clean path from a free/low-cost launch to a large-scale production marketplace.

END OF INSTRUCTIONS