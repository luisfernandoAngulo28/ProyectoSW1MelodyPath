from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework.permissions import AllowAny

schema_view = get_schema_view(
    openapi.Info(
        title="MelodyPath API",
        default_version="v1",
        description="API REST para la Plataforma Inteligente de Aprendizaje Musical Gamificado con IA",
        contact=openapi.Contact(email="melgar@melodypath.com"),
    ),
    public=True,
    permission_classes=[AllowAny],
)

api_patterns = [
    # Auth
    path("auth/", include("apps.users.urls")),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Resources
    path("instruments/", include("apps.instruments.urls")),
    path("lessons/", include("apps.lessons.urls")),
    path("exercises/", include("apps.exercises.urls")),
    path("assessment/", include("apps.assessment.urls")),
    path("progress/", include("apps.progress.urls")),
    path("challenges/", include("apps.gamification.urls.challenges")),
    path("badges/", include("apps.gamification.urls.badges")),
    path("ranking/", include("apps.gamification.urls.ranking")),
    path("community/", include("apps.community.urls")),
    path("ai/", include("apps.ai_analysis.urls")),
    path("admin-panel/", include("apps.users.admin_urls")),
]

urlpatterns = [
    path("django-admin/", admin.site.urls),
    path("api/", include(api_patterns)),
    # Swagger / Redoc
    path("api/docs/", schema_view.with_ui("swagger", cache_timeout=0), name="schema-swagger-ui"),
    path("api/redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
