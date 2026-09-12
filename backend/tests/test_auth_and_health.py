import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
def test_health_check_endpoint():
    client = APIClient()
    response = client.get("/api/v1/health/")
    assert response.status_code == 200
    assert response.data["status"] == "ok"
    assert response.data["database"] == "connected"


@pytest.mark.django_db
def test_user_registration_and_login():
    client = APIClient()
    # 1. Register
    reg_data = {
        "email": "student@example.com",
        "password": "StrongPassword123!",
        "first_name": "Test",
        "last_name": "Student",
        "timezone": "America/Toronto",
    }
    response = client.post("/api/v1/users/register/", reg_data, format="json")
    assert response.status_code == 201
    assert response.data["email"] == "student@example.com"
    assert response.data["timezone"] == "America/Toronto"

    # 2. Check /me authenticated session
    me_resp = client.get("/api/v1/users/me/")
    assert me_resp.status_code == 200
    assert me_resp.data["email"] == "student@example.com"

    # 3. Logout
    logout_resp = client.post("/api/v1/users/logout/")
    assert logout_resp.status_code == 200

    # 4. Login
    login_resp = client.post(
        "/api/v1/users/login/",
        {"email": "student@example.com", "password": "StrongPassword123!"},
        format="json",
    )
    assert login_resp.status_code == 200
