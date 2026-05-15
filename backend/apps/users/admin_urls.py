from django.urls import path
from apps.users.admin_views import AdminStatsView, AdminPlatformStatsView
from apps.users.views import AdminUserListView, AdminUserDetailView

urlpatterns = [
    path("stats/", AdminStatsView.as_view(), name="admin-stats"),
    path("platform-stats/", AdminPlatformStatsView.as_view(), name="admin-platform-stats"),
    path("users/", AdminUserListView.as_view(), name="admin-user-list"),
    path("users/<int:pk>/", AdminUserDetailView.as_view(), name="admin-user-detail"),
]
