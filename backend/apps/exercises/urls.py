from django.urls import path
from . import views

urlpatterns = [
    path("", views.ExerciseListView.as_view(), name="exercise-list"),
    path("<int:pk>/", views.ExerciseDetailView.as_view(), name="exercise-detail"),
    path("<int:pk>/submit/", views.SubmitExerciseView.as_view(), name="exercise-submit"),
    path("admin/", views.ExerciseAdminView.as_view(), name="exercise-admin"),
    path("admin/<int:pk>/", views.ExerciseAdminDetailView.as_view(), name="exercise-admin-detail"),
]
