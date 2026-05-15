from django.urls import path
from .. import views

urlpatterns = [
    path("", views.RankingView.as_view(), name="ranking"),
]
