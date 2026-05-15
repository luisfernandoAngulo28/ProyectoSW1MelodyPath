from django.urls import path
from . import views

urlpatterns = [
    path("initial/", views.InitialAssessmentView.as_view(), name="assessment-initial"),
    path("initial/submit/", views.SubmitInitialAssessmentView.as_view(), name="assessment-submit"),
    path("module/<int:module_id>/", views.ModuleEvaluationView.as_view(), name="module-eval"),
]
