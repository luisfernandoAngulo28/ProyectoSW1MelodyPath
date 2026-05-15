from django.urls import path
from . import views

urlpatterns = [
    path("", views.ProgressStatsView.as_view(), name="progress-stats"),
    path("stats/", views.ProgressStatsView.as_view(), name="progress-stats-alt"),
    path("history/", views.ProgressHistoryView.as_view(), name="progress-history"),
    path("reminders/", views.ReminderListCreateView.as_view(), name="reminder-list"),
    path("reminders/<int:pk>/", views.ReminderDetailView.as_view(), name="reminder-detail"),
]
