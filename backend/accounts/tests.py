from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

User = get_user_model()


class AuthenticationApiTests(APITestCase):
    def test_register_login_and_profile(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "alice",
                "email": "alice@example.com",
                "password": "Correct-Horse-Battery-9!",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.data)
        self.assertIn("access", response.data)

        login = self.client.post(
            "/api/auth/login/",
            {"email": "alice@example.com", "password": "Correct-Horse-Battery-9!"},
            format="json",
        )
        self.assertEqual(login.status_code, 200, login.data)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        profile = self.client.get("/api/auth/profile/")
        self.assertEqual(profile.status_code, 200)
        self.assertEqual(profile.data["username"], "alice")

    def test_duplicate_registration_is_rejected(self):
        User.objects.create_user(username="taken", password="valid-password-987")
        response = self.client.post(
            "/api/auth/register/",
            {"username": "taken", "password": "Another-Valid-Password-987!"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)
