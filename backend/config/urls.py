from django.urls import include, path
from django.http import JsonResponse


def api_index(request):
    return JsonResponse(
        {
            "name": "AI Email Classifier API",
            "status": "ok",
            "endpoints": {
                "register": "/api/auth/register/",
                "login": "/api/auth/login/",
                "profile": "/api/auth/profile/",
                "classify": "/api/classify/predict/",
                "history": "/api/classify/history/",
                "stats": "/api/classify/stats/",
                "metrics": "/api/classify/metrics/",
            },
            "frontend": "http://localhost:5173/",
        }
    )

urlpatterns = [
    path("", api_index, name="api-index"),
    path("api/", api_index, name="api-root"),
    path("api/auth/", include("accounts.urls")),
    path("api/classify/", include("classifier.urls")),
]
