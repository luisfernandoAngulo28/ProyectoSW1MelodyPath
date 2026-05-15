from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.db.models import Count, Sum, Avg
from datetime import date, timedelta

from apps.users.models import User
from apps.lessons.models import Lesson, UserLesson
from apps.exercises.models import ExerciseAttempt
from apps.gamification.models import Challenge, Badge


class AdminStatsView(APIView):
    """HU-025: Platform-wide statistics for admin."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        today = date.today()
        week_ago = today - timedelta(days=7)

        total_users = User.objects.filter(is_active=True).count()
        new_this_week = User.objects.filter(date_joined__date__gte=week_ago).count()
        premium_users = User.objects.filter(is_premium=True).count()
        total_lessons = Lesson.objects.filter(is_active=True).count()
        completions = UserLesson.objects.filter(completed=True).count()
        avg_accuracy = ExerciseAttempt.objects.aggregate(
            avg=Avg("is_correct")
        )["avg"] or 0

        # Most popular lessons
        popular = (
            UserLesson.objects
            .filter(completed=True)
            .values("lesson__title","lesson__id")
            .annotate(completions=Count("id"))
            .order_by("-completions")[:5]
        )

        # Active users per day (last 7 days)
        daily_active = []
        for i in range(6, -1, -1):
            d = today - timedelta(days=i)
            count = ExerciseAttempt.objects.filter(attempted_at__date=d).values("user").distinct().count()
            daily_active.append({"date": d.isoformat(), "users": count})

        return Response({
            "total_users": total_users,
            "new_this_week": new_this_week,
            "premium_users": premium_users,
            "total_lessons": total_lessons,
            "total_completions": completions,
            "avg_accuracy_percent": round(avg_accuracy * 100, 1),
            "popular_lessons": list(popular),
            "daily_active_users": daily_active,
        })


class AdminPlatformStatsView(APIView):
    """HU-025: Extended platform metrics."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response({
            "users_by_role": {
                "user": User.objects.filter(role="user").count(),
                "admin": User.objects.filter(role="admin").count(),
                "premium": User.objects.filter(is_premium=True).count(),
            },
            "lessons_by_level": {
                "beginner": Lesson.objects.filter(level="beginner").count(),
                "intermediate": Lesson.objects.filter(level="intermediate").count(),
                "advanced": Lesson.objects.filter(level="advanced").count(),
            },
            "total_challenges": Challenge.objects.filter(is_active=True).count(),
            "total_badges": Badge.objects.filter(is_active=True).count(),
            "total_exercise_attempts": ExerciseAttempt.objects.count(),
        })
