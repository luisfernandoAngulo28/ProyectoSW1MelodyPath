from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Avg
from .models import ProgressRecord, PracticeReminder
from .serializers import ProgressRecordSerializer, PracticeReminderSerializer


class ProgressStatsView(APIView):
    """HU-016: Overall progress stats for the user."""
    def get(self, request):
        user = request.user
        from apps.lessons.models import UserLesson
        from apps.exercises.models import ExerciseAttempt

        completed_lessons = UserLesson.objects.filter(user=user, completed=True).count()
        total_exercises = ExerciseAttempt.objects.filter(user=user).count()
        correct_exercises = ExerciseAttempt.objects.filter(user=user, is_correct=True).count()
        accuracy = round((correct_exercises / total_exercises * 100), 1) if total_exercises else 0

        weekly = ProgressRecord.objects.filter(user=user).order_by("-date")[:7]

        return Response({
            "level": user.level,
            "xp": user.xp,
            "xp_next": user.xp_next,
            "xp_percent": round(user.xp / user.xp_next * 100, 1) if user.xp_next else 0,
            "streak": user.streak,
            "completed_lessons": completed_lessons,
            "total_exercises": total_exercises,
            "accuracy_percent": accuracy,
            "instrument": str(user.instrument) if user.instrument else None,
            "initial_level": user.initial_level,
            "weekly_history": ProgressRecordSerializer(weekly, many=True).data,
        })


class ProgressHistoryView(generics.ListAPIView):
    """HU-016: Daily progress history."""
    serializer_class = ProgressRecordSerializer

    def get_queryset(self):
        return ProgressRecord.objects.filter(user=self.request.user).order_by("-date")[:30]


class ReminderListCreateView(generics.ListCreateAPIView):
    """HU-017: List and create practice reminders."""
    serializer_class = PracticeReminderSerializer

    def get_queryset(self):
        return PracticeReminder.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReminderDetailView(generics.RetrieveUpdateDestroyAPIView):
    """HU-017: Update or delete a reminder."""
    serializer_class = PracticeReminderSerializer

    def get_queryset(self):
        return PracticeReminder.objects.filter(user=self.request.user)
