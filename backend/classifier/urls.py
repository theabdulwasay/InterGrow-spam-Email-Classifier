from django.urls import path

from .views import HistoryDeleteView, HistoryView, MetricsView, PredictView, StatsView

urlpatterns = [
    path("predict/", PredictView.as_view(), name="predict"),
    path("history/", HistoryView.as_view(), name="history"),
    path("history/<int:pk>/", HistoryDeleteView.as_view(), name="history-delete"),
    path("stats/", StatsView.as_view(), name="stats"),
    path("metrics/", MetricsView.as_view(), name="metrics"),
]
