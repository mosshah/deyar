# Database Architecture & Schemas

## Custom User (`users.User`)
- `id` (UUID PK)
- `email` (Unique, Lowercase, Indexed)
- `first_name`
- `last_name`
- `timezone` (Default UTC, valid IANA timezone string)
- `is_active`, `is_staff`, `is_superuser`
- `created_at`, `updated_at`

## Teacher (`teachers.TeacherProfile`)
- `user` (OneToOneField to User)
- `slug` (Unique, CharField)
- `headline` (CharField)
- `bio` (TextField)
- `profile_photo` (ImageField / URL)
- `location` (CharField)
- `years_experience` (PositiveIntegerField)
- `hourly_rate` (DecimalField)
- `booking_mode` (`INSTANT` or `APPROVAL_REQUIRED`)
- `is_verified` (BooleanField)
- `is_active` (BooleanField)
- `average_rating` (DecimalField, cached aggregate)
- `review_count` (PositiveIntegerField, cached count)

## Availability (`availability.TeacherAvailability`)
- `teacher` (ForeignKey to TeacherProfile)
- `day_of_week` (0=Monday, 6=Sunday)
- `start_time` (TimeField)
- `end_time` (TimeField)
- `is_active` (BooleanField)

## Availability Exceptions (`availability.AvailabilityException`)
- `teacher` (ForeignKey to TeacherProfile)
- `start_datetime` (DateTimeField in UTC)
- `end_datetime` (DateTimeField in UTC)
- `exception_type` (`VACATION`, `BLOCKED`, `HOLIDAY`, `OTHER`)
- `reason` (CharField)

## Lessons / Bookings (`bookings.Lesson`)
- `teacher` (ForeignKey to TeacherProfile)
- `student` (ForeignKey to StudentProfile)
- `lesson_series` (ForeignKey to LessonSeries, nullable)
- `lesson_type` (ForeignKey to LessonType)
- `start_datetime_utc` (DateTimeField)
- `end_datetime_utc` (DateTimeField)
- `status` (`PENDING`, `CONFIRMED`, `REJECTED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`, `EXPIRED`)
- `notes` (TextField)
