# Deyar Architecture Documentation

## 1. System Overview

Deyar is a two-sided teaching marketplace connecting students with verified teachers.

```
                  +--------------------------------+
                  |      Next.js Frontend          |
                  |  (React, TypeScript, Tailwind) |
                  +---------------+----------------+
                                  |
                           REST API (/api/v1/)
                                  |
                                  v
                  +--------------------------------+
                  |      Django Monolith API       |
                  |  (DRF, Modular Domain Apps)    |
                  +---------------+----------------+
                                  |
                        PostgreSQL (Source of Truth)
```

## 2. Monolith Domain Structure

Backend is organized as a modular monolith in `backend/`:
- `users`: Custom User model with email authentication and timezone preferences.
- `teachers`: Teacher profile, subjects, levels, languages, verification, pricing, booking mode.
- `students`: Student profile, goals, interests.
- `subjects`: Global subjects taxonomy and teaching levels.
- `availability`: Weekly recurring availability and exception dates/times.
- `bookings`: Single lessons, weekly lesson series, transactional booking flow, concurrency protection.
- `reviews`: Completed lesson ratings and reviews, aggregate teacher rating calculation.
- `common`: Cross-cutting helpers (models, responses, permissions, middleware).

## 3. Concurrency & Integrity Strategy

- **Booking Source of Truth**: Internal PostgreSQL database with transactional integrity and range/exclusion locking.
- **Double-booking Protection**: Database constraints + SELECT FOR UPDATE transactional checks ensuring no conflicting active lessons for a teacher.
- **Stateless API Layer**: Django API remains fully stateless to enable horizontal scaling behind load balancers.
