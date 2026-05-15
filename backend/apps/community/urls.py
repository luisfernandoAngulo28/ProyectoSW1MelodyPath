from django.urls import path
from . import views

urlpatterns = [
    path("", views.CommunityListView.as_view(), name="community-list"),
    path("<int:pk>/", views.CommunityDetailView.as_view(), name="community-detail"),
    path("<int:pk>/join/", views.JoinCommunityView.as_view(), name="community-join"),
    path("achievements/", views.SharedAchievementListView.as_view(), name="shared-achievements"),
    path("achievements/share/", views.ShareAchievementView.as_view(), name="share-achievement"),
]
