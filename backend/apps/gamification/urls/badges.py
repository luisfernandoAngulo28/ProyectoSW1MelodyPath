from django.urls import path
from .. import views

urlpatterns = [
    path("", views.BadgeListView.as_view(), name="badge-list"),
    path("user/", views.UserBadgeListView.as_view(), name="user-badges"),
]
