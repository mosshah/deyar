# Deyar Booking Architecture & Rules

## 1. Internal Database as Source of Truth
Deyar's PostgreSQL database is authoritative for all lessons and availability. External calendars are treated strictly as secondary synchronization targets.

## 2. Dynamic Slot Generation
Slots are not stored as pre-generated database rows. Instead, recurring weekly availability rules (`TeacherAvailability`) are intersected with `AvailabilityException` records (vacations, blocked slots) and active bookings (`PENDING` or `CONFIRMED`) to produce open candidate intervals dynamically for a requested date range.

## 3. Timezone Handling
- All timestamp values in the database are stored in **UTC**.
- Availability rules are interpreted according to the teacher's configured IANA timezone (e.g. `America/Toronto`).
- Frontend shows slots translated into the student's local timezone while explicitly indicating both timezones.

## 4. Booking State Machine
```
[PENDING] --------> [CONFIRMED] --------> [COMPLETED]
    |                      |                  |
    +-----> [REJECTED]     +-----> [CANCELLED]+-----> [NO_SHOW]
    |                      |
    +-----> [CANCELLED]    +-----> [EXPIRED]
```

## 5. Double-Booking Protection & Concurrency
1. **Transaction Isolation**: All booking operations are executed inside PostgreSQL transactions (`@transaction.atomic`).
2. **Locking**: Row-level locking on teacher records or lesson slots (`select_for_update()`).
3. **Database Constraints**: Overlap check exclusion constraints (`tsrange` / `tstzrange` in PostgreSQL with btree_gist) to mathematically disallow two non-cancelled overlapping lessons for the same teacher.
