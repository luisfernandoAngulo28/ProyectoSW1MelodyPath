from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils import timezone
from .models import AssessmentQuestion, UserAssessment, ModuleEvaluation
from .serializers import (
    AssessmentQuestionSerializer, UserAssessmentSerializer,
    SubmitAssessmentSerializer, ModuleEvaluationSerializer
)


def classify_level(score: float) -> str:
    """HU-004: Automatically classify user level based on score."""
    if score >= 75:
        return "advanced"
    elif score >= 45:
        return "intermediate"
    return "beginner"


class InitialAssessmentView(APIView):
    """HU-003: Get initial diagnostic questions."""
    def get(self, request):
        questions = AssessmentQuestion.objects.filter(is_active=True).order_by("order")
        serializer = AssessmentQuestionSerializer(questions, many=True)
        return Response(serializer.data)


class SubmitInitialAssessmentView(APIView):
    """HU-003, HU-004: Submit answers, classify level, set learning path."""
    def post(self, request):
        if hasattr(request.user, "assessment"):
            return Response({"detail": "Ya completaste la evaluación inicial."}, status=400)

        answers = request.data.get("answers", [])
        if not answers:
            return Response({"detail": "No se recibieron respuestas."}, status=400)

        questions = AssessmentQuestion.objects.filter(is_active=True)
        correct = 0
        answer_log = {}
        for item in answers:
            q_id = item.get("question_id")
            user_ans = item.get("answer", "")
            try:
                q = questions.get(id=q_id)
                is_correct = q.correct_answer.strip().lower() == user_ans.strip().lower()
                if is_correct:
                    correct += 1
                answer_log[q_id] = {"answer": user_ans, "correct": is_correct}
            except AssessmentQuestion.DoesNotExist:
                pass

        total = questions.count() or 1
        score = round((correct / total) * 100, 2)
        level = classify_level(score)

        assessment = UserAssessment.objects.create(
            user=request.user,
            answers=answer_log,
            score=score,
            assigned_level=level,
        )
        # Update user's level
        request.user.initial_assessment_done = True
        request.user.initial_level = level
        request.user.save(update_fields=["initial_assessment_done","initial_level"])

        return Response({
            "score": score,
            "assigned_level": level,
            "assigned_level_display": assessment.get_assigned_level_display(),
            "message": f"Tu nivel asignado es: {assessment.get_assigned_level_display()}",
        })


class ModuleEvaluationView(APIView):
    """HU-012: Get module evaluation and submit answers."""
    def get(self, request, module_id):
        from apps.exercises.models import Exercise
        exercises = Exercise.objects.filter(lesson_id=module_id, is_active=True)
        from apps.exercises.serializers import ExerciseSerializer
        return Response(ExerciseSerializer(exercises, many=True).data)

    def post(self, request, module_id):
        from apps.lessons.models import Lesson
        try:
            lesson = Lesson.objects.get(id=module_id)
        except Lesson.DoesNotExist:
            return Response({"detail": "Módulo no encontrado."}, status=404)

        answers = request.data.get("answers", [])
        from apps.exercises.models import Exercise
        exercises = Exercise.objects.filter(lesson=lesson, is_active=True)

        correct = sum(
            1 for item in answers
            for ex in [exercises.filter(id=item.get("exercise_id")).first()]
            if ex and ex.correct_answer.strip().lower() == str(item.get("answer","")).strip().lower()
        )
        total = exercises.count() or 1
        score = round((correct / total) * 100, 2)
        passed = score >= 60

        eval_obj = ModuleEvaluation.objects.create(
            user=request.user, lesson=lesson,
            score=score, passed=passed,
            answers={str(a.get("exercise_id")): a.get("answer") for a in answers},
            feedback="¡Excelente trabajo!" if passed else "Sigue practicando, casi lo logras.",
        )
        if passed:
            request.user.add_xp(lesson.xp_reward)

        return Response({
            "score": score,
            "passed": passed,
            "correct": correct,
            "total": total,
            "feedback": eval_obj.feedback,
            "xp_earned": lesson.xp_reward if passed else 0,
        })
