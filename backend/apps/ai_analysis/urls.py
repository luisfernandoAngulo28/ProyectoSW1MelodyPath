from django.urls import path
from . import views

urlpatterns = [
    path("audio/", views.AudioAnalysisView.as_view(), name="ai-audio"),
    path("analyze/", views.PerformanceAnalysisView.as_view(), name="ai-analyze"),
    path("recommendations/", views.RecommendationsView.as_view(), name="ai-recommendations"),
]
