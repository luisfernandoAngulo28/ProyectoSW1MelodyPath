from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from django.db import models
from .models import Exercise, ExerciseAttempt
from .serializers import ExerciseSerializer, ExerciseSubmitSerializer, ExerciseAttemptSerializer


class ExerciseListView(generics.ListAPIView):
    """HU-008, HU-009: List exercises filtered by type/instrument/difficulty."""
    serializer_class = ExerciseSerializer
    filterset_fields = ["exercise_type", "difficulty", "instrument", "lesson"]

    def get_queryset(self):
        qs = Exercise.objects.filter(is_active=True)
        user = self.request.user
        # Filter by instrument if user has one selected,
        # but also include exercises with no instrument assigned (general exercises).
        if user.instrument_id:
            qs = qs.filter(
                models.Q(instrument=user.instrument) | models.Q(instrument__isnull=True)
            )
        return qs


class ExerciseDetailView(generics.RetrieveAPIView):
    serializer_class = ExerciseSerializer
    queryset = Exercise.objects.filter(is_active=True)


class SubmitExerciseView(APIView):
    """HU-008, HU-009, HU-010: Submit answer and get immediate feedback."""
    def post(self, request, pk):
        try:
            exercise = Exercise.objects.get(pk=pk, is_active=True)
        except Exercise.DoesNotExist:
            return Response({"detail": "Ejercicio no encontrado."}, status=404)

        serializer = ExerciseSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_answer = serializer.validated_data["answer"].strip().lower()
        correct_answer = exercise.correct_answer.strip().lower()
        is_correct = user_answer == correct_answer

        attempt = ExerciseAttempt.objects.create(
            user=request.user,
            exercise=exercise,
            user_answer=serializer.validated_data["answer"],
            is_correct=is_correct,
            response_time_ms=request.data.get("response_time_ms"),
            feedback=exercise.explanation if not is_correct else "¡Correcto! 🎉",
        )

        if is_correct:
            request.user.add_xp(exercise.xp_reward)

        # HU-010: Immediate feedback
        return Response({
            "is_correct": is_correct,
            "correct_answer": exercise.correct_answer,
            "explanation": exercise.explanation,
            "feedback": attempt.feedback,
            "xp_earned": exercise.xp_reward if is_correct else 0,
        })


class ExerciseAdminView(generics.ListCreateAPIView):
    """Admin CRUD for exercises."""
    serializer_class = ExerciseSerializer
    queryset = Exercise.objects.all()
    permission_classes = [permissions.IsAdminUser]


class ExerciseAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExerciseSerializer
    queryset = Exercise.objects.all()
    permission_classes = [permissions.IsAdminUser]
