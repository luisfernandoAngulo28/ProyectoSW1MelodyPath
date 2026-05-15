from django.urls import path
from apps.gamification import views

urlpatterns = [
    path("", views.ChallengeListView.as_view(), name="challenge-list"),
    path("<int:pk>/complete/", views.CompleteChallengeView.as_view(), name="challenge-complete"),
]
