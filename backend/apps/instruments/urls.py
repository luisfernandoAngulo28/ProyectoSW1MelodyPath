from django.urls import path
from . import views

urlpatterns = [
    path("", views.InstrumentListView.as_view(), name="instrument-list"),
    path("<int:pk>/", views.InstrumentDetailView.as_view(), name="instrument-detail"),
    path("admin/", views.InstrumentAdminView.as_view(), name="instrument-admin"),
    path("admin/<int:pk>/", views.InstrumentAdminDetailView.as_view(), name="instrument-admin-detail"),
]
