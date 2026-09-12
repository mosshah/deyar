from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("common.urls")),
    path("api/v1/users/", include("users.urls")),
    path("api/v1/teachers/", include("teachers.urls")),
    path("api/v1/students/", include("students.urls")),
    path("api/v1/subjects/", include("subjects.urls")),
    path("api/v1/availability/", include("availability.urls")),
    path("api/v1/bookings/", include("bookings.urls")),
    path("api/v1/reviews/", include("reviews.urls")),
]
