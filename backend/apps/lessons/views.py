from rest_framework import generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.utils import timezone
from .models import Lesson, UserLesson
from .serializers import LessonSerializer, UserLessonSerializer


class LessonViewSet(ModelViewSet):
    """HU-007: Interactive tutorials. HU-013: Unlock levels. HU-022: Admin create/update."""
    serializer_class = LessonSerializer
    filterset_fields = ["instrument","level","lesson_type","is_premium"]
    search_fields = ["title","description"]
    ordering_fields = ["order","created_at"]

    def get_queryset(self):
        qs = Lesson.objects.filter(is_active=True)
        user = self.request.user
        # Non-premium users can't see premium lessons
        if not (user.is_premium or user.role == "admin"):
            qs = qs.filter(is_premium=False)
        # Filter by user's instrument if not specified
        instrument = self.request.query_params.get("instrument")
        if not instrument and user.instrument_id:
            qs = qs.filter(instrument=user.instrument)
        return qs

    def get_permissions(self):
        if self.action in ["create","update","partial_update","destroy"]:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        """HU-013: Mark lesson as complete, award XP."""
        lesson = self.get_object()
        user_lesson, created = UserLesson.objects.get_or_create(
            user=request.user, lesson=lesson,
            defaults={"attempts": 1}
        )
        if not user_lesson.completed:
            user_lesson.completed = True
            user_lesson.completed_at = timezone.now()
            user_lesson.save()
            new_level = request.user.add_xp(lesson.xp_reward)
            # Award badge if first lesson
            _check_first_lesson_badge(request.user)
            return Response({
                "message": f"¡Lección completada! +{lesson.xp_reward} XP",
                "xp_earned": lesson.xp_reward,
                "new_level": new_level,
            })
        return Response({"message": "Ya completaste esta lección."})


def _check_first_lesson_badge(user):
    from apps.gamification.models import Badge, UserBadge
    count = UserLesson.objects.filter(user=user, completed=True).count()
    if count == 1:
        badge = Badge.objects.filter(slug="first_lesson").first()
        if badge:
            UserBadge.objects.get_or_create(user=user, badge=badge)
